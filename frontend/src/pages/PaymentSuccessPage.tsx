import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-3xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>
          <p className="text-sm text-muted-foreground">
            You will receive a confirmation email with your order details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={() => navigate({ to: '/dashboard' })}>View Orders</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/products' })}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
