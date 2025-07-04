import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PhonePe Configuration
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const PHONEPE_MERCHANT_ID = 'SU2506281111064322988053';
const PHONEPE_SALT_KEY = '0908f5a4-d27d-4e73-a27c-2d7668266f61';
const PHONEPE_SALT_INDEX = 1;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create checksum for status check
    const checksumString = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}${PHONEPE_SALT_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + `###${PHONEPE_SALT_INDEX}`;

    // Check payment status
    const statusResponse = await fetch(
      `${PHONEPE_BASE_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
          'accept': 'application/json'
        }
      }
    );

    const statusData = await statusResponse.json();
    console.log('PhonePe status response:', statusData);

    if (statusData.success && statusData.data?.state === 'COMPLETED') {
      // Payment successful - update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          razorpay_payment_id: statusData.data.transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', transactionId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: 'COMPLETED',
          paymentId: statusData.data.transactionId,
          amount: statusData.data.amount
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else if (statusData.data?.state === 'FAILED') {
      // Payment failed - update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', transactionId);

      if (updateError) {
        console.error('Error updating failed order:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          status: 'FAILED',
          error: 'Payment failed'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Payment pending
      return new Response(
        JSON.stringify({
          success: true,
          status: 'PENDING'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('PhonePe callback error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});