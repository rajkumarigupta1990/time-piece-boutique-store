import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PhonePe Configuration
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox'; // Use production URL for live
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { orderId, amount, callbackUrl } = await req.json();

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Order ID and amount are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create transaction ID
    const transactionId = `TXN_${orderId}_${Date.now()}`;

    // Prepare payment request
    const paymentRequest = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: `USER_${orderId}`,
      amount: amount * 100, // Convert to paise
      redirectUrl: callbackUrl || `${req.headers.get('origin')}/payment-callback`,
      redirectMode: "POST",
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-callback`,
      mobileNumber: "9999999999", // This should come from order details
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // Encode payload
    const payload = btoa(JSON.stringify(paymentRequest));
    
    // Create checksum
    const checksumString = `${payload}/pg/v1/pay${PHONEPE_SALT_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + `###${PHONEPE_SALT_INDEX}`;

    // Make API call to PhonePe
    const phonePeResponse = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json'
      },
      body: JSON.stringify({
        request: payload
      })
    });

    const responseData = await phonePeResponse.json();

    if (responseData.success) {
      // Update order with PhonePe transaction details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          razorpay_order_id: transactionId, // Using this field for PhonePe transaction ID
          status: 'pending'
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
          transactionId: transactionId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to initiate payment',
          details: responseData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('PhonePe initiate error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});