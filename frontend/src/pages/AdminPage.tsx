import { useState } from 'react';
import { useIsCallerAdmin, useIsStripeConfigured, useSetStripeConfiguration, useGetAllProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import type { Product } from '../backend';
import { Badge } from '../components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();
  const { data: products } = useGetAllProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState('US,CA,GB');
  const [showStripeDialog, setShowStripeDialog] = useState(false);

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    inventory: '',
    categories: '',
    images: '',
  });

  const handleStripeSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripeSecretKey.trim() || !allowedCountries.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: stripeSecretKey.trim(),
        allowedCountries: allowedCountries.split(',').map((c) => c.trim()),
      });
      toast.success('Stripe configuration saved successfully!');
      setShowStripeDialog(false);
      setStripeSecretKey('');
    } catch (error) {
      toast.error('Failed to save Stripe configuration');
      console.error(error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name.trim() || !productForm.price || !productForm.inventory) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const product: Product = {
        id: editingProduct ? editingProduct.id : Date.now().toString(),
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: BigInt(Math.round(parseFloat(productForm.price) * 100)),
        inventory: BigInt(productForm.inventory),
        categories: productForm.categories.split(',').map((c) => c.trim()).filter(Boolean),
        images: productForm.images.split(',').map((i) => i.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await updateProduct.mutateAsync(product);
        toast.success('Product updated successfully!');
      } else {
        await addProduct.mutateAsync(product);
        toast.success('Product added successfully!');
      }

      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({ id: '', name: '', description: '', price: '', inventory: '', categories: '', images: '' });
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toString(),
      inventory: product.inventory.toString(),
      categories: product.categories.join(', '),
      images: product.images.join(', '),
    });
    setShowProductDialog(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct.mutateAsync(productId);
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your tailor shop</p>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Product Management</h2>
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({ id: '', name: '', description: '', price: '', inventory: '', categories: '', images: '' });
                  }}
                >
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (USD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Inventory *</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={productForm.inventory}
                        onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="categories">Categories (comma-separated)</Label>
                    <Input
                      id="categories"
                      value={productForm.categories}
                      onChange={(e) => setProductForm({ ...productForm, categories: e.target.value })}
                      placeholder="suits, formal, men"
                    />
                  </div>
                  <div>
                    <Label htmlFor="images">Image URLs (comma-separated)</Label>
                    <Textarea
                      id="images"
                      value={productForm.images}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      placeholder="/assets/generated/mens-suit-display.dim_400x600.jpg, /assets/generated/womens-dress-display.dim_400x600.jpg"
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addProduct.isPending || updateProduct.isPending}>
                    {addProduct.isPending || updateProduct.isPending ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="line-clamp-1">{product.name}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEditProduct(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">${(Number(product.price) / 100).toFixed(2)}</p>
                      <Badge variant={Number(product.inventory) > 0 ? 'default' : 'secondary'}>
                        Stock: {product.inventory.toString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No products yet. Add your first product!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {stripeConfigured ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Configured</Badge>
                    <p className="text-sm text-muted-foreground">Stripe payment is set up and ready to use.</p>
                  </div>
                  <Dialog open={showStripeDialog} onOpenChange={setShowStripeDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Update Configuration</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Stripe Configuration</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleStripeSetup} className="space-y-4">
                        <div>
                          <Label htmlFor="secretKey">Stripe Secret Key *</Label>
                          <Input
                            id="secretKey"
                            type="password"
                            value={stripeSecretKey}
                            onChange={(e) => setStripeSecretKey(e.target.value)}
                            placeholder="sk_test_..."
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="countries">Allowed Countries (comma-separated) *</Label>
                          <Input
                            id="countries"
                            value={allowedCountries}
                            onChange={(e) => setAllowedCountries(e.target.value)}
                            placeholder="US,CA,GB"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={setStripeConfig.isPending}>
                          {setStripeConfig.isPending ? 'Saving...' : 'Update Configuration'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <form onSubmit={handleStripeSetup} className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure Stripe to enable payment processing for your shop.
                  </p>
                  <div>
                    <Label htmlFor="secretKey">Stripe Secret Key *</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      placeholder="sk_test_..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="countries">Allowed Countries (comma-separated) *</Label>
                    <Input
                      id="countries"
                      value={allowedCountries}
                      onChange={(e) => setAllowedCountries(e.target.value)}
                      placeholder="US,CA,GB"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={setStripeConfig.isPending}>
                    {setStripeConfig.isPending ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
