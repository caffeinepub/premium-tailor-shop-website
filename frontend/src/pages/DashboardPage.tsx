import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetOrdersByCustomer,
  useGetAlterationRequestsByCustomer,
  useGetAppointmentsByCustomer,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Package, Scissors, Calendar, User } from 'lucide-react';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const { data: orders, isLoading: ordersLoading } = useGetOrdersByCustomer();
  const { data: alterations, isLoading: alterationsLoading } = useGetAlterationRequestsByCustomer();
  const { data: appointments, isLoading: appointmentsLoading } = useGetAppointmentsByCustomer();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please login to view your dashboard.</p>
            <Button>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.name || 'valued customer'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alterations</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alterations?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="alterations">Alterations</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Loading orders...</p>
              </CardContent>
            </Card>
          ) : orders && orders.length > 0 ? (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(Number(order.orderTime) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Items:</span> {order.items.length}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> ${(Number(order.totalAmount) / 100).toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Shipping to:</span> {order.shippingDetails.name},{' '}
                      {order.shippingDetails.city}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alterations" className="space-y-4">
          {alterationsLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Loading alterations...</p>
              </CardContent>
            </Card>
          ) : alterations && alterations.length > 0 ? (
            alterations.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="capitalize">{request.garmentType}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Request #{request.id} • {new Date(Number(request.requestTime) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  {Number(request.estimatedPrice) > 0 && (
                    <p className="text-sm font-medium mt-2">
                      Estimated: ${(Number(request.estimatedPrice) / 100).toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't submitted any alteration requests yet.</p>
                <Button onClick={() => navigate({ to: '/alterations' })}>Request Alterations</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          {appointmentsLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="capitalize">{appointment.serviceType.replace('-', ' ')}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(Number(appointment.dateTime) / 1000000).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                {appointment.notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't booked any appointments yet.</p>
                <Button onClick={() => navigate({ to: '/appointments' })}>Book Appointment</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base">{profile.phone}</p>
                  </div>
                  {profile.measurements && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Measurements</p>
                      <p className="text-base">{profile.measurements}</p>
                    </div>
                  )}
                  {profile.preferences && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Preferences</p>
                      <p className="text-base">{profile.preferences}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Loading profile...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
