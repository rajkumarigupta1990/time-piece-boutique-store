
import React from 'react';
import { Button } from '../ui/button';
import PaymentBreakdown from './PaymentBreakdown';

interface OrderSummaryProps {
  subtotal: number;
  shippingCharge: number;
  otherCharges?: number; // NEW
  discountAmount: number;
  totalAmount: number;
  payableNow?: number;
  payableAtDelivery?: number;
  selectedPaymentMethod?: 'online' | 'cod';
  showPaymentBreakdown?: boolean;
  onCheckout: () => void;
  isCheckingOut: boolean;
  formatPrice: (price: number) => string;
}

const OrderSummary = ({
  subtotal,
  shippingCharge,
  otherCharges = 0,
  discountAmount,
  totalAmount,
  payableNow = 0,
  payableAtDelivery = 0,
  selectedPaymentMethod,
  showPaymentBreakdown = false,
  onCheckout,
  isCheckingOut,
  formatPrice,
}: OrderSummaryProps) => {
  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subtotal:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Shipping:</span>
        <span>{formatPrice(shippingCharge)}</span>
      </div>

      {otherCharges > 0 && (
        <div className="flex justify-between text-sm">
          <span>Other Charges:</span>
          <span>{formatPrice(otherCharges)}</span>
        </div>
      )}

      {discountAmount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount:</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}

      {showPaymentBreakdown && selectedPaymentMethod === 'cod' && (
        <PaymentBreakdown
          payableNow={payableNow}
          payableAtDelivery={payableAtDelivery}
          formatPrice={formatPrice}
        />
      )}

      <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
        <span>Total:</span>
        <span className="text-luxury-gold">{formatPrice(totalAmount)}</span>
      </div>

      <Button
        onClick={onCheckout}
        className="w-full mt-4 bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep"
        disabled={isCheckingOut}
      >
        {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
      </Button>
    </div>
  );
};

export default OrderSummary;
