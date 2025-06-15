
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentCollectionSettings {
  id: string;
  collect_shipping_upfront: boolean;
  collect_other_charges_upfront: boolean;
  shipping_charge: number;
  updated_at: string;
}

export const usePaymentCollectionSettings = () => {
  return useQuery({
    queryKey: ['payment-collection-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_collection_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as PaymentCollectionSettings;
    },
  });
};

export const useUpdatePaymentCollectionSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<PaymentCollectionSettings>) => {
      const { data, error } = await supabase
        .from('payment_collection_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id!)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-collection-settings'] });
    },
  });
};
