import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';

export const useOrderTracking = (phoneNumber: string) => {
  return useQuery({
    queryKey: ['order-tracking', phoneNumber],
    queryFn: async () => {
      if (!phoneNumber || phoneNumber.length < 10) {
        return [];
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .ilike('shipping_address->phone', `%${phoneNumber}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Order type
      return data.map(order => ({
        id: order.id,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address as any,
        created_at: order.created_at,
        updated_at: order.updated_at,
        status: order.status as Order['status'],
        discount_amount: order.discount_amount || 0,
        razorpay_order_id: order.razorpay_order_id || undefined,
        razorpay_payment_id: order.razorpay_payment_id || undefined,
        coupon_code: order.coupon_code || undefined,
        user_id: order.user_id || undefined,
        order_items: order.order_items?.map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          created_at: item.created_at,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            original_price: item.product.original_price,
            images: item.product.images,
            description: item.product.description,
            features: item.product.features,
            category: item.product.category,
            in_stock: item.product.in_stock,
            rating: item.product.rating,
            reviews: item.product.reviews,
            moq: item.product.moq,
            additional_charges: (item.product.additional_charges as any) || [],
            created_at: item.product.created_at,
            updated_at: item.product.updated_at,
            video_url: item.product.video_url
          } : undefined
        })) || []
      } as Order));
    },
    enabled: Boolean(phoneNumber && phoneNumber.length >= 10),
  });
};