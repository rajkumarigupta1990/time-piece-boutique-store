
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  features: string[];
  category: 'luxury' | 'sport' | 'classic' | 'smart';
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
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
