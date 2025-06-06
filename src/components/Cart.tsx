
import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShippingAddress } from '@/types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
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

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout.",
        variant: "destructive"
      });
      return;
    }
    setShowShippingForm(true);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);

    try {
      // Create order with Razorpay
      const response = await fetch('https://rhbpyacohntcqlszgvle.supabase.co/functions/v1/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE`
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress,
          totalAmount: getCartTotal()
        })
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay payment
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Luxury Watch Store',
        description: 'Purchase of luxury watches',
        order_id: orderData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            await fetch('https://rhbpyacohntcqlszgvle.supabase.co/functions/v1/verify-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE`
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                orderId: orderData.orderId
              })
            });

            toast({
              title: "Payment Successful!",
              description: "Your order has been placed successfully.",
            });

            clearCart();
            onClose();
            setShowShippingForm(false);
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

  if (showShippingForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shipping Details</DialogTitle>
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
                {isCheckingOut ? 'Processing...' : `Pay ${formatPrice(getCartTotal())}`}
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
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-luxury-gold font-semibold">{formatPrice(item.price)}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total: </span>
                <span className="text-luxury-gold">{formatPrice(getCartTotal())}</span>
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
