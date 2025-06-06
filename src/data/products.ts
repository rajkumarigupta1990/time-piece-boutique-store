
import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Royal Heritage Classic',
    brand: 'TimePiece',
    price: 125000,
    original_price: 150000,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    description: 'A masterpiece of horological excellence, the Royal Heritage Classic combines traditional craftsmanship with modern precision.',
    features: ['Swiss Movement', 'Sapphire Crystal', 'Water Resistant 100m', 'Leather Strap', '2 Year Warranty'],
    category: 'luxury',
    in_stock: true,
    rating: 4.8,
    reviews: 24
  },
  {
    id: '2',
    name: 'SportMax Pro',
    brand: 'AquaTime',
    price: 85000,
    images: ['/placeholder.svg', '/placeholder.svg'],
    description: 'Built for athletes and adventurers, featuring robust construction and advanced timing capabilities.',
    features: ['Titanium Case', 'Ceramic Bezel', 'Water Resistant 300m', 'Luminous Hands', '3 Year Warranty'],
    category: 'sport',
    in_stock: true,
    rating: 4.6,
    reviews: 18
  },
  {
    id: '3',
    name: 'Executive Gold',
    brand: 'LuxuryTime',
    price: 200000,
    original_price: 250000,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    description: 'The pinnacle of luxury timepieces, crafted with 18k gold and adorned with premium materials.',
    features: ['18k Gold Case', 'Diamond Markers', 'Swiss Automatic', 'Crocodile Leather', 'Lifetime Service'],
    category: 'luxury',
    in_stock: true,
    rating: 4.9,
    reviews: 35
  },
  {
    id: '4',
    name: 'SmartTech Elite',
    brand: 'TechTime',
    price: 45000,
    images: ['/placeholder.svg', '/placeholder.svg'],
    description: 'The future of timekeeping with smart features and classic design aesthetics.',
    features: ['Smart Features', 'Heart Rate Monitor', 'GPS Tracking', 'Wireless Charging', '1 Year Warranty'],
    category: 'smart',
    in_stock: true,
    rating: 4.4,
    reviews: 52
  },
  {
    id: '5',
    name: 'Vintage Classic',
    brand: 'Heritage',
    price: 95000,
    images: ['/placeholder.svg', '/placeholder.svg'],
    description: 'Timeless design inspired by vintage watchmaking traditions with modern reliability.',
    features: ['Vintage Design', 'Manual Wind', 'Exhibition Back', 'Vintage Leather', '2 Year Warranty'],
    category: 'classic',
    in_stock: false,
    rating: 4.7,
    reviews: 28
  },
  {
    id: '6',
    name: 'Ocean Diver',
    brand: 'DeepSea',
    price: 75000,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    description: 'Professional diving watch with exceptional water resistance and luminous visibility.',
    features: ['Diving Bezel', 'Helium Valve', 'Water Resistant 500m', 'Luminous Dial', '5 Year Warranty'],
    category: 'sport',
    in_stock: true,
    rating: 4.5,
    reviews: 19
  }
];
