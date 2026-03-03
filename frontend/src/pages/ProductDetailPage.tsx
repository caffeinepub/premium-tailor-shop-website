import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetProductById } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateCheckoutSession } from '../hooks/useQueries';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: product, isLoading } = useGetProductById(productId);
  const [quantity, setQuantity] = useState(1);
  const createCheckout = useCreateCheckoutSession();

  const handlePurchase = async () => {
    if (!identity) {
      toast.error('Please login to make a purchase');
      return;
    }

    if (!product) return;

    try {
      const items = [
        {
          productName: product.name,
          productDescription: product.description,
          priceInCents: product.price,
          quantity: BigInt(quantity),
          currency: 'usd',
        },
      ];

      const session = await createCheckout.mutateAsync(items);
      window.location.href = session.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">Product not found</p>
        <Button onClick={() => navigate({ to: '/products' })}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" onClick={() => navigate({ to: '/products' })} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            {product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, idx) => (
                <div key={idx} className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {product.categories.map((cat) => (
                <Badge key={cat} variant="outline" className="capitalize">
                  {cat}
                </Badge>
              ))}
            </div>
            <p className="text-3xl font-bold">${(Number(product.price) / 100).toFixed(2)}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Availability</h2>
            <Badge variant={Number(product.inventory) > 0 ? 'default' : 'secondary'}>
              {Number(product.inventory) > 0 ? `${product.inventory} in stock` : 'Out of Stock'}
            </Badge>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(Number(product.inventory), quantity + 1))}
                disabled={quantity >= Number(product.inventory)}
              >
                +
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handlePurchase}
            disabled={Number(product.inventory) === 0 || createCheckout.isPending}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {createCheckout.isPending ? 'Processing...' : 'Purchase Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
