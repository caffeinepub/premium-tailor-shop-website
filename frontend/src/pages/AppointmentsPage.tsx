import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAppointmentsByCustomer, useCreateAppointment } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar } from '../components/ui/calendar';
import { toast } from 'sonner';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function AppointmentsPage() {
  const { identity } = useInternetIdentity();
  const { data: appointments, isLoading } = useGetAppointmentsByCustomer();
  const createAppointment = useCreateAppointment();

  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please login to book an appointment');
      return;
    }

    if (!serviceType || !date || !timeSlot) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(date);
      const [time, period] = timeSlot.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      appointmentDateTime.setHours(hour, parseInt(minutes), 0, 0);

      await createAppointment.mutateAsync({
        id: '',
        customerId: identity.getPrincipal(),
        serviceType,
        dateTime: BigInt(appointmentDateTime.getTime() * 1000000),
        status: 'pending',
        notes: notes.trim(),
        createdTime: BigInt(0),
      });

      toast.success('Appointment booked successfully!');
      setServiceType('');
      setDate(undefined);
      setTimeSlot('');
      setNotes('');
    } catch (error) {
      toast.error('Failed to book appointment');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CalendarIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Book an Appointment</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Schedule a home visit for measurements, fittings, or consultations at your convenience.
        </p>
      </div>

      {!identity ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please login to book appointments and view your schedule.</p>
            <Button>Login</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="new" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Appointment</TabsTrigger>
            <TabsTrigger value="history">My Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Home Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="measurements">Initial Measurements</SelectItem>
                        <SelectItem value="fitting">Fitting Session</SelectItem>
                        <SelectItem value="consultation">Style Consultation</SelectItem>
                        <SelectItem value="delivery">Garment Delivery & Final Fitting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Select Date *</Label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="rounded-md border mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeSlot">Time Slot *</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger id="timeSlot">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or information we should know?"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createAppointment.isPending}>
                    {createAppointment.isPending ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Loading your appointments...</p>
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
                        <Badge variant={getStatusColor(appointment.status)} className="capitalize">
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    {appointment.notes && (
                      <CardContent>
                        <p className="text-muted-foreground">{appointment.notes}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">You haven't booked any appointments yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
