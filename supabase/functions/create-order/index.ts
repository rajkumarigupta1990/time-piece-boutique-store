
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      items, 
      shippingAddress, 
      totalAmount, 
      paymentMethod, 
      couponCode, 
      discountAmount, 
      codShippingOnly = false,
      codShippingUpfrontPaid = false 
    } = await req.json();

    console.log('Order creation request:', { 
      totalAmount, 
      paymentMethod, 
      codShippingOnly, 
      codShippingUpfrontPaid,
      itemsCount: items?.length || 0
    });

    const supabaseUrl = 'https://rhbpyacohntcqlszgvle.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA5MjAsImV4cCI6MjA2NDgxNjkyMH0.MSJEKJsIkZs9SKHG3K6PQAJOeFsWrIcUum7BmWXXnYE';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // For COD shipping-only orders, don't create main order
    if (codShippingOnly) {
      // Create Razorpay order for shipping charges only
      const razorpayOrderResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('rzp_test_PBM2Y93ANCIoG2:d5cwiAvh98MH4deTvSfEqMH5')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount * 100, // Convert to paise
          currency: 'INR',
          receipt: `shipping_${Date.now()}`,
        }),
      });

      const razorpayOrder = await razorpayOrderResponse.json();

      if (!razorpayOrderResponse.ok) {
        throw new Error(razorpayOrder.error?.description || 'Failed to create Razorpay order');
      }

      // Create a temporary order entry for the shipping payment tracking
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          razorpay_order_id: razorpayOrder.id,
          status: 'pending',
          coupon_code: 'SHIPPING_ONLY',
          discount_amount: 0
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      return new Response(
        JSON.stringify({
          razorpayOrderId: razorpayOrder.id,
          orderId: order.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: 'rzp_test_PBM2Y93ANCIoG2'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For regular orders (both online and COD)
    let razorpayOrder = null;
    
    // Only create Razorpay order for online payments
    if (paymentMethod === 'online') {
      const razorpayOrderResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('rzp_test_PBM2Y93ANCIoG2:d5cwiAvh98MH4deTvSfEqMH5')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount * 100, // Convert to paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      razorpayOrder = await razorpayOrderResponse.json();

      if (!razorpayOrderResponse.ok) {
        throw new Error(razorpayOrder.error?.description || 'Failed to create Razorpay order');
      }
    }

    // Create order in Supabase
    const orderData: any = {
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      status: paymentMethod === 'online' ? 'pending' : 'confirmed',
      coupon_code: couponCode || null,
      discount_amount: discountAmount || 0
    };

    if (razorpayOrder) {
      orderData.razorpay_order_id = razorpayOrder.id;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    // Create order items only if items are provided
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message);
      }
    }

    console.log('Order created successfully:', { orderId: order.id, paymentMethod });

    // Return appropriate response based on payment method
    if (paymentMethod === 'online') {
      return new Response(
        JSON.stringify({
          razorpayOrderId: razorpayOrder.id,
          orderId: order.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: 'rzp_test_PBM2Y93ANCIoG2'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          orderId: order.id,
          message: 'COD order placed successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
