
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, couponData, couponId } = await req.json()

    let result;

    switch (method) {
      case 'create':
        result = await supabaseAdmin
          .from('coupons')
          .insert({
            ...couponData,
            current_uses: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        break;

      case 'update':
        result = await supabaseAdmin
          .from('coupons')
          .update({
            ...couponData,
            updated_at: new Date().toISOString()
          })
          .eq('id', couponId)
          .select()
          .single();
        break;

      case 'delete':
        result = await supabaseAdmin
          .from('coupons')
          .delete()
          .eq('id', couponId);
        break;

      case 'list':
        result = await supabaseAdmin
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      default:
        throw new Error('Invalid method');
    }

    if (result.error) {
      throw result.error;
    }

    return new Response(JSON.stringify(result.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
