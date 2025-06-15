import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { usePaymentCollectionSettings } from '@/hooks/usePaymentCollectionSettings';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShippingAddress, CouponValidation } from '@/types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { data: paymentSettings } = usePaymentSettings();
  const { data: paymentCollectionSettings } = usePaymentCollectionSettings();
  const validateCoupon = useValidateCoupon();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'online' | 'cod'>('online');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const subtotal = getCartTotal();
  const discountAmount = appliedCoupon?.discount_amount || 0;
  
  // Calculate shipping charges based on payment collection settings
  const shippingCharge = paymentCollectionSettings?.shipping_charge || 50;
  const shouldCollectShippingUpfront = paymentCollectionSettings?.collect_shipping_upfront || false;
  
  // Always include shipping in total if collecting upfront, regardless of payment method
  const includeShippingInTotal = shouldCollectShippingUpfront;
  const totalWithShipping = includeShippingInTotal ? subtotal + shippingCharge : subtotal;
  const finalTotal = totalWithShipping - discountAmount;

  // New helper: Create Razorpay order for either shipping charge or full order
  const createRazorpayOrder = async ({
      amount,
      shippingAddress,
      paymentMethod,
      items,
      couponCode,
      discountAmount,
      codShippingOnly = false
    }: {
      amount: number,
      shippingAddress: ShippingAddress,
      paymentMethod: 'online'|'cod',
      items: any[],
      couponCode: string|undefined,
      discountAmount: number,
      codShippingOnly?: boolean,
    }
  ) => {
    // For COD-with-shipping, send a marker to backend (so backend knows this is only shipping)
    const requestBody = {
      items: codShippingOnly ? [] : items, // For shipping payments, no order items
      shippingAddress,
      totalAmount: amount,
      paymentMethod,
      couponCode,
      discountAmount,
      codShippingOnly,
    };

    // Always call the same endpoint
    const response = await fetch('https://rhbpyacohntcqlszgvle.supabase.co/functions/v1/create-order', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE`
      },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to create order');
    return result; // Razorpay order details
  };

  // New: COD shipping charge upfront flow
  const [isPayingShipping, setIsPayingShipping] = useState(false);

  // New main handler - refactor for clarity and correct flow!
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);

    // Helper for successful shipping upfront payment before placing actual COD order
    async function handleCodShippingUpfront() {
      setIsPayingShipping(true);
      try {
        // 1. Create a Razorpay order for just the shipping charge
        const rpResult = await createRazorpayOrder({
          amount: shippingCharge,
          shippingAddress,
          paymentMethod: 'cod',
          items: [],
          couponCode: undefined,
          discountAmount: 0,
          codShippingOnly: true,
        });

        const options = {
          key: rpResult.key,
          amount: rpResult.amount,
          currency: rpResult.currency,
          name: 'Shipping Charge',
          description: 'Shipping payment for COD order',
          order_id: rpResult.razorpayOrderId,
          handler: async (response: any) => {
            // 2. Verify shipping payment
            try {
              await fetch('https://rhbpyacohntcqlszgvle.supabase.co/functions/v1/verify-payment', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE`
                },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  orderId: rpResult.orderId
                })
              });

              // 3. Place COD order for the remaining items (without shipping charge)
              const codOrderBody = {
                items: cartItems,
                shippingAddress,
                totalAmount: finalTotal - shippingCharge, // Exclude shipping, already paid
                paymentMethod: 'cod',
                couponCode: appliedCoupon?.coupon_data?.code,
                discountAmount,
                codShippingUpfrontPaid: true, // Just for possible backend reference
              };
              const codResp = await fetch('https://rhbpyacohntcqlszgvle.supabase.co/functions/v1/create-order', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE`
                },
                body: JSON.stringify(codOrderBody)
              });
              const codResult = await codResp.json();
              if (!codResp.ok) throw new Error(codResult.error || 'Failed to place COD order after shipping payment');
              toast({
                title: "Order Placed!",
                description: "Shipping charge collected. Remaining to be paid at delivery.",
              });
              clearCart();
              setAppliedCoupon(null);
              setCouponCode('');
              setShowShippingForm(false);
              onClose();
            } catch (err) {
              toast({
                title: "COD Order Failed",
                description: err instanceof Error ? err.message : "Please contact support.",
                variant: "destructive"
              });
            }
            setIsPayingShipping(false);
          },
          prefill: {
            name: shippingAddress.name,
            email: shippingAddress.email,
            contact: shippingAddress.phone,
          },
          theme: {
            color: '#D4AF37',
          }
        };
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } catch (error) {
        toast({
          title: "Shipping Payment Failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive"
        });
        setIsPayingShipping(false);
      }
      setIsCheckingOut(false);
    }

    // COD, shipping upfront, process above flow
    if (selectedPaymentMethod === 'cod' && includeShippingInTotal) {
      // Don't place order directly, first collect shipping payment!
      await handleCodShippingUpfront();
      return;
    }

    try {
      // Online payment or simple COD without shipping upfront
      const orderData = {
        items: cartItems,
        shippingAddress,
        totalAmount: finalTotal,
        paymentMethod: selectedPaymentMethod,
        couponCode: appliedCoupon?.coupon_data?.code,
        discountAmount: discountAmount,
      };

      if (selectedPaymentMethod === 'cod') {
        // COD, but shipping not collected upfront
        const response = await fetch('https://rhbpyacohntcqlszgvle.supabase.co/functions/v1/create-order', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE`
          },
          body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create order');
        }

        toast({
          title: "Order Placed Successfully!",
          description: includeShippingInTotal ? 
            "Your COD order has been placed with shipping charges already collected." :
            "Your COD order has been placed. Shipping charges will be collected at delivery.",
        });

        clearCart();
        onClose();
        setShowShippingForm(false);
        setAppliedCoupon(null);
        setCouponCode('');
      } else {
        // Handle online (full) payment
        const result = await createRazorpayOrder({
          amount: finalTotal,
          shippingAddress,
          paymentMethod: 'online',
          items: cartItems,
          couponCode: appliedCoupon?.coupon_data?.code,
          discountAmount
        });

        const options = {
          key: result.key,
          amount: result.amount,
          currency: result.currency,
          name: 'Luxury Watch Store',
          description: 'Purchase of luxury watches',
          order_id: result.razorpayOrderId,
          handler: async (response: any) => {
            try {
              await fetch('https://rhbpyacohntcqlszgvle.supabase.co/functions/v1/verify-payment', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE`
                },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  orderId: result.orderId
                })
              });

              toast({
                title: "Payment Successful!",
                description: "Your order has been placed successfully.",
              });

              clearCart();
              onClose();
              setShowShippingForm(false);
              setAppliedCoupon(null);
              setCouponCode('');
            } catch (error) {
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support.",
                variant: "destructive"
              });
            }
          },
          prefill: {
            name: shippingAddress.name,
            email: shippingAddress.email,
            contact: shippingAddress.phone
          },
          theme: {
            color: '#D4AF37'
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code.",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        orderTotal: subtotal
      });

      if (result.is_valid) {
        setAppliedCoupon(result);
        toast({
          title: "Coupon Applied!",
          description: result.message,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate coupon.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order.",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout.",
        variant: "destructive"
      });
      return;
    }

    // Check if any payment method is enabled
    const codEnabled = paymentSettings?.cod_enabled || false;
    const onlineEnabled = paymentSettings?.online_payment_enabled || false;
    
    if (!codEnabled && !onlineEnabled) {
      toast({
        title: "Payment Unavailable",
        description: "No payment methods are currently available. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    // Set default payment method based on what's available
    if (onlineEnabled && !codEnabled) {
      setSelectedPaymentMethod('online');
    } else if (codEnabled && !onlineEnabled) {
      setSelectedPaymentMethod('cod');
    }

    setShowShippingForm(true);
  };

  const handleQuantityUpdate = (productId: string, newQuantity: number) => {
    const item = cartItems.find(item => item.id === productId);
    const moq = item?.moq || 1;
    
    // Ensure quantity doesn't go below MOQ
    if (newQuantity < moq) {
      toast({
        title: "Minimum Order Quantity",
        description: `Minimum order quantity for this item is ${moq}`,
        variant: "destructive"
      });
      return;
    }
    
    updateQuantity(productId, newQuantity);
  };

  if (showShippingForm) {
    const codEnabled = paymentSettings?.cod_enabled || false;
    const onlineEnabled = paymentSettings?.online_payment_enabled || false;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shipping Details & Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <Input
              placeholder="Full Name"
              value={shippingAddress.name}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={shippingAddress.email}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              placeholder="Phone"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
            <Input
              placeholder="Address"
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                required
              />
              <Input
                placeholder="State"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
            <Input
              placeholder="Pincode"
              value={shippingAddress.pincode}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
              required
            />
            {/* Payment Method Selection */}
            {codEnabled && onlineEnabled && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={selectedPaymentMethod === 'online'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as 'online' | 'cod')}
                      className="mr-2"
                    />
                    Online Payment (Cards, UPI, Wallets)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={selectedPaymentMethod === 'cod'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as 'online' | 'cod')}
                      className="mr-2"
                    />
                    Cash on Delivery (COD)
                  </label>
                </div>
              </div>
            )}
            {/* Order Summary in Checkout */}
            <div className="border-t pt-4 space-y-2 bg-gray-50 p-3 rounded">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>
                  {includeShippingInTotal ? formatPrice(shippingCharge) : 
                   'Collected at delivery'}
                </span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span className="text-luxury-gold">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowShippingForm(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isCheckingOut}
                className="flex-1 bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep"
              >
                {isCheckingOut ? 'Processing...' : 
                 selectedPaymentMethod === 'cod' ? `Place COD Order ${formatPrice(finalTotal)}` : 
                 `Pay ${formatPrice(finalTotal)}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Shopping Cart ({cartItems.length})</span>
          </DialogTitle>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              const moq = item.moq || 1;
              return (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-luxury-gold font-semibold">{formatPrice(item.price)}</p>
                    {moq > 1 && (
                      <p className="text-xs text-blue-600">MOQ: {moq}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - moq)}
                        className="h-8 w-8"
                        disabled={item.quantity <= moq}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + moq)}
                        className="h-8 w-8"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}

            {/* Coupon Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Apply Coupon
              </h4>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div>
                    <span className="font-medium text-green-800">{appliedCoupon.coupon_data?.code}</span>
                    <p className="text-sm text-green-600">Discount: {formatPrice(discountAmount)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon}
                    variant="outline"
                  >
                    {isValidatingCoupon ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>
                  {includeShippingInTotal ? formatPrice(shippingCharge) : 
                   'Collected at delivery'}
                </span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span className="text-luxury-gold">{formatPrice(finalTotal)}</span>
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full mt-4 bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Cart;
