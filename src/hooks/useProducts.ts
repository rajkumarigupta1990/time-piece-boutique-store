
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, AdditionalCharge } from '@/types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert database records to Product type
      return data.map(item => ({
        ...item,
        additional_charges: (item.additional_charges as unknown as AdditionalCharge[]) || []
      })) as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Convert database record to Product type
      return {
        ...data,
        additional_charges: (data.additional_charges as unknown as AdditionalCharge[]) || []
      } as Product;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      // Convert Product type to database compatible format
      const dbProduct = {
        ...product,
        additional_charges: product.additional_charges as any
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert back to Product type
      return {
        ...data,
        additional_charges: (data.additional_charges as unknown as AdditionalCharge[]) || []
      } as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      // Convert Product type to database compatible format
      const dbUpdates = {
        ...updates,
        additional_charges: updates.additional_charges as any
      };
      
      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert back to Product type
      return {
        ...data,
        additional_charges: (data.additional_charges as unknown as AdditionalCharge[]) || []
      } as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
