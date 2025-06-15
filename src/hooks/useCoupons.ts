
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, CouponValidation } from '@/types';

const callAdminCouponFunction = async (method: string, data?: any) => {
  const { data: result, error } = await supabase.functions.invoke('admin-coupons', {
    body: { method, ...data }
  });
  
  if (error) throw error;
  return result;
};

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      return await callAdminCouponFunction('list');
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'current_uses' | 'created_at' | 'updated_at'>) => {
      return await callAdminCouponFunction('create', { couponData: coupon });
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
      return await callAdminCouponFunction('update', { couponData: updates, couponId: id });
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
      return await callAdminCouponFunction('delete', { couponId: id });
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
