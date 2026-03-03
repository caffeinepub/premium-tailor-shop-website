import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    measurements : Text;
    preferences : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    images : [Text];
    categories : [Text];
    inventory : Nat;
  };

  public type Order = {
    id : Text;
    customerId : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    paymentStatus : Text;
    shippingDetails : ShippingDetails;
    orderTime : Time.Time;
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
  };

  public type ShippingDetails = {
    name : Text;
    address : Text;
    city : Text;
    postalCode : Text;
    country : Text;
  };

  public type AlterationRequest = {
    id : Text;
    customerId : Principal;
    garmentType : Text;
    description : Text;
    photos : [Text];
    estimatedPrice : Nat;
    status : Text;
    requestTime : Time.Time;
  };

  public type Appointment = {
    id : Text;
    customerId : Principal;
    serviceType : Text;
    dateTime : Time.Time;
    status : Text;
    notes : Text;
    createdTime : Time.Time;
  };

  public type Customer = {
    id : Principal;
    name : Text;
    email : Text;
    phone : Text;
    measurements : Text;
    preferences : Text;
  };

  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, Order>();
  let alterationRequests = Map.empty<Text, AlterationRequest>();
  let appointments = Map.empty<Text, Appointment>();
  let customers = Map.empty<Principal, Customer>();

  var nextOrderId = 1;
  var nextAlterationRequestId = 1;
  var nextAppointmentId = 1;

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductById(productId : Text) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  public shared ({ caller }) func createOrder(order : Order) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let orderId = nextOrderId.toText();
    nextOrderId += 1;

    let newOrder : Order = {
      id = orderId;
      customerId = caller;
      items = order.items;
      totalAmount = order.totalAmount;
      paymentStatus = order.paymentStatus;
      shippingDetails = order.shippingDetails;
      orderTime = Time.now();
    };

    orders.add(orderId, newOrder);
    orderId;
  };

  public query ({ caller }) func getOrderById(orderId : Text) : async Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getOrdersByCustomer(customerId : Principal) : async [Order] {
    if (customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    let resultList = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.customerId == customerId) {
        resultList.add(order);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          customerId = order.customerId;
          items = order.items;
          totalAmount = order.totalAmount;
          paymentStatus = status;
          shippingDetails = order.shippingDetails;
          orderTime = order.orderTime;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func createAlterationRequest(request : AlterationRequest) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create alteration requests");
    };

    let requestId = nextAlterationRequestId.toText();
    nextAlterationRequestId += 1;

    let newRequest : AlterationRequest = {
      id = requestId;
      customerId = caller;
      garmentType = request.garmentType;
      description = request.description;
      photos = request.photos;
      estimatedPrice = request.estimatedPrice;
      status = request.status;
      requestTime = Time.now();
    };

    alterationRequests.add(requestId, newRequest);
    requestId;
  };

  public query ({ caller }) func getAlterationRequestById(requestId : Text) : async AlterationRequest {
    switch (alterationRequests.get(requestId)) {
      case (null) { Runtime.trap("Alteration request not found") };
      case (?request) {
        if (request.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own alteration requests");
        };
        request;
      };
    };
  };

  public query ({ caller }) func getAlterationRequestsByCustomer(customerId : Principal) : async [AlterationRequest] {
    if (customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own alteration requests");
    };

    let resultList = List.empty<AlterationRequest>();
    for ((_, request) in alterationRequests.entries()) {
      if (request.customerId == customerId) {
        resultList.add(request);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateAlterationRequestStatus(requestId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update alteration request status");
    };
    switch (alterationRequests.get(requestId)) {
      case (null) { Runtime.trap("Alteration request not found") };
      case (?request) {
        let updatedRequest : AlterationRequest = {
          id = request.id;
          customerId = request.customerId;
          garmentType = request.garmentType;
          description = request.description;
          photos = request.photos;
          estimatedPrice = request.estimatedPrice;
          status = status;
          requestTime = request.requestTime;
        };
        alterationRequests.add(requestId, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func createAppointment(appointment : Appointment) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create appointments");
    };

    let appointmentId = nextAppointmentId.toText();
    nextAppointmentId += 1;

    let newAppointment : Appointment = {
      id = appointmentId;
      customerId = caller;
      serviceType = appointment.serviceType;
      dateTime = appointment.dateTime;
      status = appointment.status;
      notes = appointment.notes;
      createdTime = Time.now();
    };

    appointments.add(appointmentId, newAppointment);
    appointmentId;
  };

  public query ({ caller }) func getAppointmentById(appointmentId : Text) : async Appointment {
    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        if (appointment.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own appointments");
        };
        appointment;
      };
    };
  };

  public query ({ caller }) func getAppointmentsByCustomer(customerId : Principal) : async [Appointment] {
    if (customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own appointments");
    };

    let resultList = List.empty<Appointment>();
    for ((_, appointment) in appointments.entries()) {
      if (appointment.customerId == customerId) {
        resultList.add(appointment);
      };
    };
    resultList.toArray();
  };

  public shared ({ caller }) func updateAppointmentStatus(appointmentId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update appointment status");
    };
    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updatedAppointment : Appointment = {
          id = appointment.id;
          customerId = appointment.customerId;
          serviceType = appointment.serviceType;
          dateTime = appointment.dateTime;
          status = status;
          notes = appointment.notes;
          createdTime = appointment.createdTime;
        };
        appointments.add(appointmentId, updatedAppointment);
      };
    };
  };

  public shared ({ caller }) func createOrUpdateCustomer(customer : Customer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update customer profiles");
    };

    let customerData : Customer = {
      id = caller;
      name = customer.name;
      email = customer.email;
      phone = customer.phone;
      measurements = customer.measurements;
      preferences = customer.preferences;
    };

    customers.add(caller, customerData);
  };

  public query ({ caller }) func getCustomerById(customerId : Principal) : async Customer {
    if (customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own customer profile");
    };

    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) { customer };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    customers.values().toArray();
  };
};
