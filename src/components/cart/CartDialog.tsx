
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { usePaymentCollectionSettings } from '@/hooks/usePaymentCollectionSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CouponValidation } from '@/types';
import CartItem from './CartItem';
import CouponSection from './CouponSection';
import OrderSummary from './OrderSummary';
import ShippingForm from './ShippingForm';

interface CartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDialog = ({ isOpen, onClose }: CartDialogProps) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { data: paymentSettings } = usePaymentSettings();
  const { data: paymentCollectionSettings } = usePaymentCollectionSettings();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const subtotal = getCartTotal();
  const discountAmount = appliedCoupon?.discount_amount || 0;
  const shippingCharge = paymentCollectionSettings?.shipping_charge || 50;
  const totalAmount = subtotal - discountAmount + shippingCharge;

  const handleQuantityUpdate = (productId: string, newQuantity: number) => {
    const item = cartItems.find(item => item.id === productId);
    const moq = item?.moq || 1;
    
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

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout.",
        variant: "destructive"
      });
      return;
    }

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

    setShowShippingForm(true);
  };

  const handleCouponApplied = (coupon: CouponValidation) => {
    setAppliedCoupon(coupon);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  if (showShippingForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <ShippingForm
          paymentSettings={paymentSettings}
          paymentCollectionSettings={paymentCollectionSettings}
          appliedCoupon={appliedCoupon}
          onClose={onClose}
          onBack={() => setShowShippingForm(false)}
          formatPrice={formatPrice}
        />
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
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleQuantityUpdate}
                onRemove={removeFromCart}
                formatPrice={formatPrice}
              />
            ))}

            <CouponSection
              subtotal={subtotal}
              appliedCoupon={appliedCoupon}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              formatPrice={formatPrice}
            />

            <OrderSummary
              subtotal={subtotal}
              shippingCharge={shippingCharge}
              discountAmount={discountAmount}
              totalAmount={totalAmount}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
              formatPrice={formatPrice}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;
