import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, MessageSquare, Users, Settings, Ticket, BarChart3 } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useContactQueries, useUpdateContactQueryStatus } from '@/hooks/useContactQueries';
import { usePaymentSettings, useUpdatePaymentSettings } from '@/hooks/usePaymentSettings';
import { Product, Order, ContactQuery, AdditionalCharge } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CouponManagement from '@/components/CouponManagement';
import PaymentCollectionSettings from '@/components/PaymentCollectionSettings';
import AdminDashboard from '@/components/AdminDashboard';
import OrderDetailCard from '@/components/OrderDetailCard';

const Admin = () => {
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: queries = [] } = useContactQueries();
  const { data: paymentSettings } = usePaymentSettings();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateQueryStatus = useUpdateContactQueryStatus();
  const updatePaymentSettings = useUpdatePaymentSettings();

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
    reviews: 0,
    moq: 1,
    additional_charges: []
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
      reviews: 0,
      moq: 1,
      additional_charges: []
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
        reviews: formData.reviews!,
        moq: formData.moq || 1,
        additional_charges: formData.additional_charges || []
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

  const handleAdditionalChargesChange = (charges: string) => {
    try {
      const chargesArray = charges.split('\n').filter(c => c.trim()).map(charge => {
        const [name, amount, description] = charge.split('|').map(s => s.trim());
        return {
          name,
          amount: Number(amount) || 0,
          description: description || ''
        } as AdditionalCharge;
      });
      setFormData(prev => ({ ...prev, additional_charges: chargesArray }));
    } catch (error) {
      // Handle invalid format gracefully
      setFormData(prev => ({ ...prev, additional_charges: [] }));
    }
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

  const handlePaymentSettingsUpdate = async (field: 'cod_enabled' | 'online_payment_enabled', value: boolean) => {
    try {
      await updatePaymentSettings.mutateAsync({
        cod_enabled: field === 'cod_enabled' ? value : paymentSettings?.cod_enabled || true,
        online_payment_enabled: field === 'online_payment_enabled' ? value : paymentSettings?.online_payment_enabled || true,
      });
      toast({
        title: "Success",
        description: "Payment settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment settings.",
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

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center space-x-2">
              <Ticket className="w-4 h-4" />
              <span>Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Queries ({queries.length})</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>

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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">MOQ (Minimum Order Quantity)</label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.moq || 1}
                          onChange={(e) => setFormData(prev => ({ ...prev, moq: Number(e.target.value) || 1 }))}
                          placeholder="MOQ"
                        />
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
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                      <Textarea
                        value={(formData.features || []).join('\n')}
                        onChange={(e) => handleFeatureChange(e.target.value)}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Charges (Name|Amount|Description per line)</label>
                      <Textarea
                        value={(formData.additional_charges || []).map(charge => 
                          `${charge.name}|${charge.amount}|${charge.description || ''}`
                        ).join('\n')}
                        onChange={(e) => handleAdditionalChargesChange(e.target.value)}
                        placeholder="Installation Fee|500|Professional installation&#10;Extended Warranty|1000|2 year extended warranty"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: Name|Amount|Description (Description is optional)
                      </p>
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
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-navy-deep">Order Management</h2>
              <p className="text-gray-600">
                Detailed view of all orders with products, payment status, and customer information
              </p>
              
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No orders found
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="relative">
                      <OrderDetailCard order={order} />
                      
                      {/* Status Update Section */}
                      <div className="absolute top-4 right-4">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <CouponManagement />
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

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow border border-border p-6">
                <h2 className="text-2xl font-bold text-navy-deep mb-6">Payment Methods</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-base font-medium">Cash on Delivery (COD)</label>
                      <p className="text-sm text-gray-500">
                        Allow customers to pay with cash when the order is delivered
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings?.cod_enabled || false}
                      onCheckedChange={(checked) => handlePaymentSettingsUpdate('cod_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-base font-medium">Online Payment</label>
                      <p className="text-sm text-gray-500">
                        Allow customers to pay online using Razorpay (cards, UPI, wallets, etc.)
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings?.online_payment_enabled || false}
                      onCheckedChange={(checked) => handlePaymentSettingsUpdate('online_payment_enabled', checked)}
                    />
                  </div>
                </div>

                {(!paymentSettings?.cod_enabled && !paymentSettings?.online_payment_enabled) && (
                  <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    <strong>Warning:</strong> At least one payment method should be enabled for customers to place orders.
                  </div>
                )}
              </div>

              <PaymentCollectionSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
