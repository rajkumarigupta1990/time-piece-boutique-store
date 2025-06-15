
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { Coupon, CouponValidation } from '@/types';

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  'https://rhbpyacohntcqlszgvle.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYnB5YWNvaG50Y3Fsc3pndmxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI0MDkyMCwiZXhwIjoyMDY0ODE2OTIwfQ.s1wGVuFqgXSNcB_tBh0SkI7QaIuAH0rOG2p32VdY9-M'
);

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'current_uses' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .insert({
          ...coupon,
          current_uses: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin
        .from('coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => {
      const { data, error } = await supabase
        .rpc('validate_coupon', {
          coupon_code_input: code,
          order_total: orderTotal
        });
      
      if (error) throw error;
      return data[0] as CouponValidation;
    },
  });
};
