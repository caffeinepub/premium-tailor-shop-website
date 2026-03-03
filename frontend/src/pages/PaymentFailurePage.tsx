import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-3xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment was not completed. No charges have been made to your account.
          </p>
          <p className="text-sm text-muted-foreground">
            If you experienced any issues, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={() => navigate({ to: '/products' })}>Back to Products</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
