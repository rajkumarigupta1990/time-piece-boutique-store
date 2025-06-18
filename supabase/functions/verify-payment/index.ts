
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

    const { razorpayOrderId, razorpayPaymentId, orderId } = await req.json();

    console.log('Verifying payment:', { razorpayOrderId, razorpayPaymentId, orderId });

    // Update order with payment details and mark as confirmed
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        razorpay_payment_id: razorpayPaymentId,
        status: 'confirmed'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Payment verification error:', updateError);
      throw new Error(`Failed to verify payment: ${updateError.message}`);
    }

    console.log('Payment verified successfully for order:', orderId);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in verify-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
