import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, MessageSquare, Users } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useContactQueries, useUpdateContactQueryStatus } from '@/hooks/useContactQueries';
import { Product, Order, ContactQuery } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Admin = () => {
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: queries = [] } = useContactQueries();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateQueryStatus = useUpdateContactQueryStatus();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    price: 0,
    original_price: 0,
    images: ['/placeholder.svg'],
    description: '',
    features: [],
    category: 'luxury',
    in_stock: true,
    rating: 4.5,
    reviews: 0
  });

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      price: 0,
      original_price: 0,
      images: ['/placeholder.svg'],
      description: '',
      features: [],
      category: 'luxury',
      in_stock: true,
      rating: 4.5,
      reviews: 0
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.brand || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        name: formData.name!,
        brand: formData.brand!,
        price: formData.price!,
        original_price: formData.original_price || null,
        images: formData.images || ['/placeholder.svg'],
        description: formData.description!,
        features: formData.features || [],
        category: formData.category as Product['category'],
        in_stock: formData.in_stock!,
        rating: formData.rating!,
        reviews: formData.reviews!
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
        toast({
          title: "Success",
          description: "Product updated successfully.",
        });
      } else {
        await createProduct.mutateAsync(productData);
        toast({
          title: "Success",
          description: "Product added successfully.",
        });
      }

      setEditingProduct(null);
      setIsAddingNew(false);
      setFormData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
    setFormData({});
  };

  const handleFeatureChange = (features: string) => {
    const featuresArray = features.split('\n').filter(f => f.trim());
    setFormData(prev => ({ ...prev, features: featuresArray }));
  };

  const handleImagesChange = (images: string) => {
    const imagesArray = images.split('\n').filter(img => img.trim());
    setFormData(prev => ({ ...prev, images: imagesArray }));
  };

  const handleOrderStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  const handleQueryStatusUpdate = async (queryId: string, status: ContactQuery['status']) => {
    try {
      await updateQueryStatus.mutateAsync({ id: queryId, status });
      toast({
        title: "Success",
        description: "Query status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update query status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy-deep">Admin Panel</h1>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Queries ({queries.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleAddNew} className="bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </div>

            {(editingProduct || isAddingNew) && (
              <div className="bg-white rounded-lg shadow-lg p-8 border border-border">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-navy-deep">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <Button variant="ghost" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Product name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                      <Input
                        value={formData.brand || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="Brand name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                        <Input
                          type="number"
                          value={formData.price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="Price"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                        <Input
                          type="number"
                          value={formData.original_price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, original_price: Number(e.target.value) }))}
                          placeholder="Original price"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Product['category'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="sport">Sport</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="smart">Smart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs (one per line)</label>
                      <Textarea
                        value={(formData.images || []).join('\n')}
                        onChange={(e) => handleImagesChange(e.target.value)}
                        placeholder="/image1.jpg&#10;/image2.jpg&#10;/image3.jpg"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Product description"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                      <Textarea
                        value={(formData.features || []).join('\n')}
                        onChange={(e) => handleFeatureChange(e.target.value)}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.in_stock || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.checked }))}
                          className="mr-2"
                        />
                        In Stock
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep">
                    <Save className="w-4 h-4 mr-2" />
                    Save Product
                  </Button>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.images[0]} alt={product.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.in_stock ? "default" : "secondary"}
                          className={product.in_stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{formatPrice(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.order_items?.length || 0} items</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleOrderStatusUpdate(order.id, value as Order['status'])}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="queries" className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell>{query.name}</TableCell>
                      <TableCell>{query.email}</TableCell>
                      <TableCell>{query.subject}</TableCell>
                      <TableCell>
                        <Badge variant={query.status === 'resolved' ? 'default' : 'secondary'}>
                          {query.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(query.created_at)}</TableCell>
                      <TableCell>
                        <Select
                          value={query.status}
                          onValueChange={(value) => handleQueryStatusUpdate(query.id, value as ContactQuery['status'])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
