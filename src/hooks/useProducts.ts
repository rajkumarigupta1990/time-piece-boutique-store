
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Product type
      return data.map(product => ({
        ...product,
        additional_charges: (product.additional_charges as any) || []
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
      
      // Transform the data to match our Product type
      return {
        ...data,
        additional_charges: (data.additional_charges as any) || []
      } as Product;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          brand: product.brand,
          price: product.price,
          original_price: product.original_price,
          images: product.images,
          video_url: product.video_url,
          description: product.description,
          features: product.features,
          category: product.category,
          in_stock: product.in_stock,
          rating: product.rating,
          reviews: product.reviews,
          moq: product.moq,
          additional_charges: product.additional_charges as any
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          brand: updates.brand,
          price: updates.price,
          original_price: updates.original_price,
          images: updates.images,
          video_url: updates.video_url,
          description: updates.description,
          features: updates.features,
          category: updates.category,
          in_stock: updates.in_stock,
          rating: updates.rating,
          reviews: updates.reviews,
          moq: updates.moq,
          additional_charges: updates.additional_charges as any
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
