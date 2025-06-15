
import React from 'react';
import { Copy, Package, MapPin, Phone, Mail, CreditCard, Clock } from 'lucide-react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailCardProps {
  order: Order;
}

const OrderDetailCard = ({ order }: OrderDetailCardProps) => {
  const { toast } = useToast();

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN');

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getPaymentStatus = () => {
    if (order.razorpay_payment_id) {
      return { status: 'Paid', color: 'bg-green-100 text-green-800' };
    }
    return { status: 'COD/Pending', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getRemainingAmount = () => {
    const totalAmount = Number(order.total_amount);
    const discountAmount = Number(order.discount_amount || 0);
    
    if (order.razorpay_payment_id) {
      return 0; // Fully paid
    }
    return totalAmount - discountAmount;
  };

  const paymentStatus = getPaymentStatus();
  const remainingAmount = getRemainingAmount();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Order #{order.id.slice(0, 8)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(order.id, 'Order ID')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className={
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
              order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }>
              {order.status}
            </Badge>
            <Badge variant="secondary" className={paymentStatus.color}>
              {paymentStatus.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Products Section */}
        {order.order_items && order.order_items.length > 0 && (
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" />
              Products ({order.order_items.length} items)
            </h4>
            <div className="space-y-2">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                    <div className="text-sm text-gray-500">
                      Brand: {item.product?.brand || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Qty: {item.quantity}</div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(Number(item.price))} each
                    </div>
                  </div>
                  <div className="ml-4 font-semibold">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special case for shipping-only orders */}
        {order.coupon_code === 'SHIPPING_ONLY' && (
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" />
              Order Type
            </h4>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Shipping Charges Payment</div>
              <div className="text-sm text-blue-600">
                This is an upfront payment for shipping charges on a COD order.
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4" />
            Payment Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-600">Total Amount</label>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatPrice(Number(order.total_amount))}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(order.total_amount.toString(), 'Total Amount')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {order.discount_amount && Number(order.discount_amount) > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Discount Applied</label>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">
                    -{formatPrice(Number(order.discount_amount))}
                  </span>
                  {order.coupon_code && order.coupon_code !== 'SHIPPING_ONLY' && (
                    <Badge variant="outline">{order.coupon_code}</Badge>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-600">Remaining Amount</label>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {formatPrice(remainingAmount)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(remainingAmount.toString(), 'Remaining Amount')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {order.razorpay_order_id && (
            <div className="mt-2 text-xs text-gray-500">
              Razorpay Order ID: {order.razorpay_order_id}
              {order.razorpay_payment_id && (
                <span> | Payment ID: {order.razorpay_payment_id}</span>
              )}
            </div>
          )}
        </div>

        {/* Shipping Address */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            Shipping Address
          </h4>
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{order.shipping_address.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(order.shipping_address.name, 'Customer Name')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div>{order.shipping_address.address}</div>
                <div>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(
                  `${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}`,
                  'Full Address'
                )}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4" />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{order.shipping_address.phone}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(order.shipping_address.phone, 'Phone Number')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="truncate">{order.shipping_address.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(order.shipping_address.email, 'Email')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Copy All Information */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const allInfo = `
Order Details:
Order ID: ${order.id}
Date: ${formatDate(order.created_at)}
Status: ${order.status}
Payment Status: ${paymentStatus.status}

${order.order_items && order.order_items.length > 0 ? `Products:
${order.order_items.map(item => 
  `- ${item.product?.name || 'Unknown'} (${item.product?.brand || 'Unknown'}) - Qty: ${item.quantity} - ${formatPrice(Number(item.price))} each`
).join('\n')}` : 'No items listed'}

Payment:
Total: ${formatPrice(Number(order.total_amount))}
${order.discount_amount ? `Discount: -${formatPrice(Number(order.discount_amount))}` : ''}
Remaining: ${formatPrice(remainingAmount)}

Customer:
Name: ${order.shipping_address.name}
Phone: ${order.shipping_address.phone}
Email: ${order.shipping_address.email}

Shipping Address:
${order.shipping_address.address}
${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}
              `.trim();
              
              copyToClipboard(allInfo, 'Complete Order Information');
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy All Order Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetailCard;
