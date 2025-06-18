
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

    const { method, couponData, couponId } = await req.json();

    console.log('Admin coupons function called with method:', method);

    switch (method) {
      case 'list':
        const { data: coupons, error: listError } = await supabaseClient
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });

        if (listError) throw listError;
        return new Response(JSON.stringify(coupons), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'create':
        const { data: newCoupon, error: createError } = await supabaseClient
          .from('coupons')
          .insert(couponData)
          .select()
          .single();

        if (createError) throw createError;
        return new Response(JSON.stringify(newCoupon), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update':
        const { data: updatedCoupon, error: updateError } = await supabaseClient
          .from('coupons')
          .update(couponData)
          .eq('id', couponId)
          .select()
          .single();

        if (updateError) throw updateError;
        return new Response(JSON.stringify(updatedCoupon), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'delete':
        const { error: deleteError } = await supabaseClient
          .from('coupons')
          .delete()
          .eq('id', couponId);

        if (deleteError) throw deleteError;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid method');
    }
  } catch (error) {
    console.error('Error in admin-coupons function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
