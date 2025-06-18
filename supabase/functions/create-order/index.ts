
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { items, shippingAddress, totalAmount, paymentMethod, couponCode, discountAmount, codShippingOnly = false } = body;

    console.log('Creating order with:', { totalAmount, paymentMethod, couponCode, discountAmount, codShippingOnly });

    // Create the order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: 'pending',
        discount_amount: discountAmount || 0,
        coupon_code: couponCode,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('Order created:', order.id);

    // Create order items only if not COD shipping only
    if (!codShippingOnly && items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity || 1,
        price: item.price,
      }));

      const { error: itemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        // Delete the order if items creation fails
        await supabaseClient.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('Order items created successfully');
    }

    // Create Razorpay order for payment
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('RAZORPAY_KEY_ID')}:${Deno.env.get('RAZORPAY_KEY_SECRET')}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(totalAmount * 100), // Convert to paise
        currency: 'INR',
        receipt: order.id,
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay error:', errorText);
      throw new Error(`Razorpay order creation failed: ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json();

    // Update order with Razorpay order ID
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('Order update error:', updateError);
      throw new Error(`Failed to update order with Razorpay ID: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        key: Deno.env.get('RAZORPAY_KEY_ID'),
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-order function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
