import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: string;
    categories: Array<string>;
    inventory: bigint;
    name: string;
    description: string;
    price: bigint;
    images: Array<string>;
}
export interface AlterationRequest {
    id: string;
    status: string;
    estimatedPrice: bigint;
    description: string;
    garmentType: string;
    customerId: Principal;
    requestTime: Time;
    photos: Array<string>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ShippingDetails {
    country: string;
    city: string;
    postalCode: string;
    name: string;
    address: string;
}
export interface OrderItem {
    productId: string;
    quantity: bigint;
}
export interface Order {
    id: string;
    paymentStatus: string;
    orderTime: Time;
    totalAmount: bigint;
    customerId: Principal;
    items: Array<OrderItem>;
    shippingDetails: ShippingDetails;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Customer {
    id: Principal;
    name: string;
    email: string;
    preferences: string;
    measurements: string;
    phone: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Appointment {
    id: string;
    status: string;
    serviceType: string;
    createdTime: Time;
    notes: string;
    customerId: Principal;
    dateTime: Time;
}
export interface UserProfile {
    name: string;
    email: string;
    preferences: string;
    measurements: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlterationRequest(request: AlterationRequest): Promise<string>;
    createAppointment(appointment: Appointment): Promise<string>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrUpdateCustomer(customer: Customer): Promise<void>;
    createOrder(order: Order): Promise<string>;
    deleteProduct(productId: string): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllProducts(): Promise<Array<Product>>;
    getAlterationRequestById(requestId: string): Promise<AlterationRequest>;
    getAlterationRequestsByCustomer(customerId: Principal): Promise<Array<AlterationRequest>>;
    getAppointmentById(appointmentId: string): Promise<Appointment>;
    getAppointmentsByCustomer(customerId: Principal): Promise<Array<Appointment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerById(customerId: Principal): Promise<Customer>;
    getOrderById(orderId: string): Promise<Order>;
    getOrdersByCustomer(customerId: Principal): Promise<Array<Order>>;
    getProductById(productId: string): Promise<Product>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAlterationRequestStatus(requestId: string, status: string): Promise<void>;
    updateAppointmentStatus(appointmentId: string, status: string): Promise<void>;
    updateOrderStatus(orderId: string, status: string): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
