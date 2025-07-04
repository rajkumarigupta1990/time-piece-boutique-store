import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePhonePePayment = () => {
  return useMutation({
    mutationFn: async ({ orderId, amount, callbackUrl }: {
      orderId: string;
      amount: number;
      callbackUrl?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('phonepe-initiate', {
        body: {
          orderId,
          amount,
          callbackUrl
        }
      });

      if (error) throw error;
      return data;
    },
  });
};

export const usePhonePeStatus = () => {
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data, error } = await supabase.functions.invoke('phonepe-callback', {
        body: {
          transactionId
        }
      });

      if (error) throw error;
      return data;
    },
  });
};