
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ShippingAddress, CouponValidation } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import OrderSummary from './OrderSummary';

interface ShippingFormProps {
  paymentSettings: any;
  paymentCollectionSettings: any;
  appliedCoupon: CouponValidation | null;
  onClose: () => void;
  onBack: () => void;
  formatPrice: (price: number) => string;
}

const ShippingForm = ({
  paymentSettings, 
  paymentCollectionSettings, 
  appliedCoupon, 
  onClose, 
  onBack, 
  formatPrice 
}: ShippingFormProps) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'online' | 'cod'>('online');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Calculate subtotal and other charges
  const subtotal = getCartTotal();
  const discountAmount = appliedCoupon?.discount_amount || 0;
  const shippingCharge = paymentCollectionSettings?.shipping_charge || 50;
  const shouldCollectShippingUpfront = paymentCollectionSettings?.collect_shipping_upfront || false;
  const shouldCollectOtherChargesUpfront = paymentCollectionSettings?.collect_other_charges_upfront || false;

  // Calculate total other charges from all cart items
  const otherCharges = cartItems.reduce((acc, item) => {
    const addCharges = Array.isArray(item.additional_charges)
      ? item.additional_charges.reduce((sum, charge) => sum + (charge.amount || 0), 0)
      : 0;
    return acc + addCharges * item.quantity;
  }, 0);

  const getPaymentBreakdown = () => {
    const orderTotal = subtotal - discountAmount;
    
    if (selectedPaymentMethod === 'online') {
      // All paid upfront
      return {
        payableNow: orderTotal + shippingCharge + otherCharges,
        payableAtDelivery: 0,
        totalAmount: orderTotal + shippingCharge + otherCharges,
        shippingCharge,
        otherCharges,
      };
    } else {
      let upfrontAmount = 0;
      
      if (shouldCollectShippingUpfront) {
        upfrontAmount += shippingCharge;
      }
      if (shouldCollectOtherChargesUpfront && otherCharges > 0) {
        upfrontAmount += otherCharges;
      }
      
      // Deduct charges already paid upfront from the amount due at delivery
      const deliveryAmount =
        orderTotal +
        (shouldCollectShippingUpfront ? 0 : shippingCharge) +
        (shouldCollectOtherChargesUpfront ? 0 : otherCharges);
      
      return {
        payableNow: upfrontAmount,
        payableAtDelivery: deliveryAmount,
        totalAmount: orderTotal + shippingCharge + otherCharges,
        shippingCharge,
        otherCharges,
      };
    }
  };

  const paymentBreakdown = getPaymentBreakdown();

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
    const requestBody = {
      items: codShippingOnly ? [] : items,
      shippingAddress,
      totalAmount: amount,
      paymentMethod,
      couponCode,
      discountAmount,
      codShippingOnly,
    };

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
    return result;
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isCheckingOut) {
      return;
    }
    
    setIsCheckingOut(true);

    try {
      // COD with upfront shipping collection
      if (selectedPaymentMethod === 'cod' && paymentBreakdown.payableNow > 0) {
        const rpResult = await createRazorpayOrder({
          amount: paymentBreakdown.payableNow,
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
          name: 'Upfront Charges',
          description: 'Shipping and other charges for COD order',
          order_id: rpResult.razorpayOrderId,
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
                  orderId: rpResult.orderId
                })
              });

              const codOrderBody = {
                items: cartItems,
                shippingAddress,
                totalAmount: paymentBreakdown.payableAtDelivery,
                paymentMethod: 'cod',
                couponCode: appliedCoupon?.coupon_data?.code,
                discountAmount,
                codShippingUpfrontPaid: true,
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
              if (!codResp.ok) throw new Error(codResult.error || 'Failed to place COD order after upfront payment');
              
              toast({
                title: "Order Placed!",
                description: `Upfront charges collected: ${formatPrice(paymentBreakdown.payableNow)}. Remaining ${formatPrice(paymentBreakdown.payableAtDelivery)} to be paid at delivery.`,
              });
              
              clearCart();
              onClose();
            } catch (err) {
              console.error('COD Order Error:', err);
              toast({
                title: "COD Order Failed",
                description: err instanceof Error ? err.message : "Please contact support.",
                variant: "destructive"
              });
            }
          },
          modal: {
            ondismiss: () => {
              setIsCheckingOut(false);
            }
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
        return;
      }

      const orderData = {
        items: cartItems,
        shippingAddress,
        totalAmount: paymentBreakdown.totalAmount,
        paymentMethod: selectedPaymentMethod,
        couponCode: appliedCoupon?.coupon_data?.code,
        discountAmount: discountAmount,
      };

      if (selectedPaymentMethod === 'cod') {
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
          description: `Your COD order has been placed. Total ${formatPrice(paymentBreakdown.totalAmount)} to be paid at delivery.`,
        });

        clearCart();
        onClose();
      } else {
        const result = await createRazorpayOrder({
          amount: paymentBreakdown.totalAmount,
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
            } catch (error) {
              console.error('Payment Verification Error:', error);
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support.",
                variant: "destructive"
              });
            }
          },
          modal: {
            ondismiss: () => {
              setIsCheckingOut(false);
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
      console.error('Checkout Error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const codEnabled = paymentSettings?.cod_enabled || false;
  const onlineEnabled = paymentSettings?.online_payment_enabled || false;

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Shipping Details & Payment</DialogTitle>
      </DialogHeader>
      <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
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
          
          <div className="bg-gray-50 p-3 rounded">
            <OrderSummary
              subtotal={subtotal}
              shippingCharge={paymentBreakdown.shippingCharge}
              otherCharges={paymentBreakdown.otherCharges}
              discountAmount={discountAmount}
              totalAmount={paymentBreakdown.totalAmount}
              payableNow={paymentBreakdown.payableNow}
              payableAtDelivery={paymentBreakdown.payableAtDelivery}
              selectedPaymentMethod={selectedPaymentMethod}
              showPaymentBreakdown={true}
              onCheckout={() => {}}
              isCheckingOut={false}
              formatPrice={formatPrice}
            />
          </div>
          
          <div className="flex space-x-2 sticky bottom-0 bg-white pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={isCheckingOut}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isCheckingOut}
              className="flex-1 bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep"
            >
              {isCheckingOut ? 'Processing...' : 
               selectedPaymentMethod === 'cod' && paymentBreakdown.payableNow > 0 ? 
                 `Pay Now ${formatPrice(paymentBreakdown.payableNow)}` :
               selectedPaymentMethod === 'cod' ? 
                 `Place COD Order ${formatPrice(paymentBreakdown.totalAmount)}` : 
                 `Pay ${formatPrice(paymentBreakdown.totalAmount)}`}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  );
};

export default ShippingForm;
