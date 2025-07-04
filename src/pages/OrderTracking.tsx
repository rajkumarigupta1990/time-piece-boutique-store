import React, { useState } from 'react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OrderTracking = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const { toast } = useToast();
  
  const { data: orders = [], isLoading, error } = useOrderTracking(searchPhone);

  const handleSearch = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }
    setSearchPhone(phoneNumber);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-deep mb-4">Track Your Order</h1>
          <p className="text-gray-600">Enter your mobile number to track your orders</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Enter Phone Number</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                maxLength={10}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Track Orders'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-600">Error loading orders. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {/* No Orders Found */}
        {searchPhone && orders.length === 0 && !isLoading && (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders found for this phone number.</p>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-deep">
              {orders.length} Order{orders.length > 1 ? 's' : ''} Found
            </h2>
            
            {orders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-luxury-gold">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span>{order.order_items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                      <p className="text-lg font-bold mt-2">{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium">{item.product?.name}</h5>
                            <p className="text-sm text-gray-600">{item.product?.brand}</p>
                            <p className="text-sm">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Shipping Address</span>
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{order.shipping_address.name}</p>
                      <p className="text-gray-600">{order.shipping_address.address}</p>
                      <p className="text-gray-600">
                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{order.shipping_address.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{order.shipping_address.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;