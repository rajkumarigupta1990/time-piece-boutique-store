
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaymentSettings } from '@/types';

export const usePaymentSettings = () => {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Return default settings if no record exists
      if (!data) {
        return {
          id: '1',
          cod_enabled: true,
          online_payment_enabled: true,
          updated_at: new Date().toISOString()
        } as PaymentSettings;
      }
      
      return data as PaymentSettings;
    },
  });
};

export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Omit<PaymentSettings, 'id' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payment_settings')
        .upsert({
          id: '1',
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    },
  });
};
