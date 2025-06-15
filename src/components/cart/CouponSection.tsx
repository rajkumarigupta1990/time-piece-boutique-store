
import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useToast } from '@/hooks/use-toast';
import { CouponValidation } from '@/types';

interface CouponSectionProps {
  subtotal: number;
  appliedCoupon: CouponValidation | null;
  onCouponApplied: (coupon: CouponValidation) => void;
  onCouponRemoved: () => void;
  formatPrice: (price: number) => string;
}

const CouponSection = ({ 
  subtotal, 
  appliedCoupon, 
  onCouponApplied, 
  onCouponRemoved, 
  formatPrice 
}: CouponSectionProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const validateCoupon = useValidateCoupon();
  const { toast } = useToast();

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
        onCouponApplied(result);
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
    onCouponRemoved();
    setCouponCode('');
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order.",
    });
  };

  return (
    <div className="border-t pt-4">
      <h4 className="font-medium mb-3 flex items-center">
        <Tag className="w-4 h-4 mr-2" />
        Apply Coupon
      </h4>
      
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div>
            <span className="font-medium text-green-800">{appliedCoupon.coupon_data?.code}</span>
            <p className="text-sm text-green-600">Discount: {formatPrice(appliedCoupon.discount_amount || 0)}</p>
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
  );
};

export default CouponSection;
