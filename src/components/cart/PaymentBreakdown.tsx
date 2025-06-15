
import React from 'react';

interface PaymentBreakdownProps {
  payableNow: number;
  payableAtDelivery: number;
  formatPrice: (price: number) => string;
}

const PaymentBreakdown = ({
  payableNow,
  payableAtDelivery,
  formatPrice,
}: PaymentBreakdownProps) => {
  if (payableNow === 0) return null;

  return (
    <div className="border-t pt-2 mt-2">
      <div className="flex justify-between text-sm font-medium text-blue-600">
        <span>
          Payable Now:
          <span className="block text-xs font-normal text-gray-500">
            (Shipping &amp; other upfront charges)
          </span>
        </span>
        <span>{formatPrice(payableNow)}</span>
      </div>
      <div className="flex justify-between text-sm font-medium text-orange-600">
        <span>
          Payable at Delivery:
          <span className="block text-xs font-normal text-gray-500">
            (Remaining order amount &amp; due charges)
          </span>
        </span>
        <span>{formatPrice(payableAtDelivery)}</span>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
