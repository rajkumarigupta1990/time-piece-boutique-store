
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContactQuery } from '@/types';

export const useContactQueries = () => {
  return useQuery({
    queryKey: ['contact-queries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_queries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactQuery[];
    },
  });
};

export const useCreateContactQuery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (query: Omit<ContactQuery, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data, error } = await supabase
        .from('contact_queries')
        .insert({
          ...query,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-queries'] });
    },
  });
};

export const useUpdateContactQueryStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactQuery['status'] }) => {
      const { data, error } = await supabase
        .from('contact_queries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-queries'] });
    },
  });
};
