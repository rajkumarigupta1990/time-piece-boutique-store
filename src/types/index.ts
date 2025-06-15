export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  images: string[];
  description: string;
  features: string[];
  category: 'luxury' | 'sport' | 'classic' | 'smart';
  in_stock: boolean;
  rating: number;
  reviews: number;
  moq?: number;
  additional_charges?: AdditionalCharge[];
  created_at?: string;
  updated_at?: string;
}

export interface AdditionalCharge {
  name: string;
  amount: number;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  discount_amount?: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  coupon_code?: string;
  user_id?: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface PaymentSettings {
  id: string;
  cod_enabled: boolean;
  online_payment_enabled: boolean;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'flat_amount' | 'percentage' | 'free_delivery';
  value: number;
  cap_amount?: number;
  minimum_order_amount?: number;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  order_id: string;
  discount_amount: number;
  created_at: string;
}

export interface CouponValidation {
  is_valid: boolean;
  discount_amount: number;
  message: string;
  coupon_data?: {
    id: string;
    code: string;
    name: string;
    type: string;
    value: number;
  };
}

export interface PaymentCollectionSettings {
  id: string;
  collect_shipping_upfront: boolean;
  collect_other_charges_upfront: boolean;
  shipping_charge: number;
  updated_at: string;
}
