
import React from 'react';

interface PaymentBreakdownProps {
  payableNow: number;
  payableAtDelivery: number;
  formatPrice: (price: number) => string;
}

const PaymentBreakdown = ({ payableNow, payableAtDelivery, formatPrice }: PaymentBreakdownProps) => {
  if (payableNow === 0) return null;

  return (
    <div className="border-t pt-2 mt-2">
      <div className="flex justify-between text-sm font-medium text-blue-600">
        <span>Payable Now:</span>
        <span>{formatPrice(payableNow)}</span>
      </div>
      <div className="flex justify-between text-sm font-medium text-orange-600">
        <span>Payable at Delivery:</span>
        <span>{formatPrice(payableAtDelivery)}</span>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
