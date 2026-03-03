import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAlterationRequestsByCustomer, useCreateAlterationRequest } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Scissors } from 'lucide-react';

export default function AlterationsPage() {
  const { identity } = useInternetIdentity();
  const { data: requests, isLoading } = useGetAlterationRequestsByCustomer();
  const createRequest = useCreateAlterationRequest();

  const [garmentType, setGarmentType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please login to submit an alteration request');
      return;
    }

    if (!garmentType || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createRequest.mutateAsync({
        id: '',
        customerId: identity.getPrincipal(),
        garmentType,
        description: description.trim(),
        photos: [],
        estimatedPrice: BigInt(0),
        status: 'pending',
        requestTime: BigInt(0),
      });

      toast.success('Alteration request submitted successfully!');
      setGarmentType('');
      setDescription('');
    } catch (error) {
      toast.error('Failed to submit alteration request');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'in progress':
        return 'default';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Scissors className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Alteration Services</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional alterations to ensure the perfect fit for your garments.
        </p>
      </div>

      {!identity ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please login to submit alteration requests and view your history.</p>
            <Button>Login</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="new" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="history">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Submit Alteration Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="garmentType">Garment Type *</Label>
                    <Select value={garmentType} onValueChange={setGarmentType}>
                      <SelectTrigger id="garmentType">
                        <SelectValue placeholder="Select garment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suit">Suit</SelectItem>
                        <SelectItem value="shirt">Shirt</SelectItem>
                        <SelectItem value="dress">Dress</SelectItem>
                        <SelectItem value="pants">Pants</SelectItem>
                        <SelectItem value="jacket">Jacket</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Alteration Details *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe the alterations you need (e.g., hem pants, take in waist, shorten sleeves)"
                      rows={5}
                      required
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Common Alteration Prices</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Hem pants: $15-25</li>
                      <li>• Take in/let out waist: $20-35</li>
                      <li>• Shorten sleeves: $15-30</li>
                      <li>• Adjust shoulders: $35-50</li>
                      <li>• Full suit alterations: $100-200</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      *Final pricing will be provided after assessment
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={createRequest.isPending}>
                    {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
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
                    <p className="text-muted-foreground">Loading your requests...</p>
                  </CardContent>
                </Card>
              ) : requests && requests.length > 0 ? (
                requests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="capitalize">{request.garmentType}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Request #{request.id} • {new Date(Number(request.requestTime) / 1000000).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(request.status)} className="capitalize">
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{request.description}</p>
                      {Number(request.estimatedPrice) > 0 && (
                        <p className="font-semibold">
                          Estimated Price: ${(Number(request.estimatedPrice) / 100).toFixed(2)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">You haven't submitted any alteration requests yet.</p>
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
