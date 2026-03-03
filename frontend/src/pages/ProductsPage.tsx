import { useNavigate } from '@tanstack/react-router';
import { useGetAllProducts } from '../hooks/useQueries';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useState } from 'react';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useGetAllProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...(products ? Array.from(new Set(products.flatMap((p) => p.categories))) : [])];

  const filteredProducts =
    selectedCategory === 'all' ? products : products?.filter((p) => p.categories.includes(selectedCategory));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Collection</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our exquisite range of tailored garments, each crafted with precision and care.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-64 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                {product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="line-clamp-1">{product.name}</span>
                  <Badge variant={Number(product.inventory) > 0 ? 'default' : 'secondary'}>
                    {Number(product.inventory) > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                <p className="text-2xl font-bold">${(Number(product.price) / 100).toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => navigate({ to: '/products/$productId', params: { productId: product.id } })}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
}
