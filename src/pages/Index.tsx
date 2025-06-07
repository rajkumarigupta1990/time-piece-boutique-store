
import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import TestimonialCard from '@/components/TestimonialCard';
import { testimonials } from '@/data/testimonials';
import { products as fallbackProducts } from '@/data/products';
import { Star, Award, Shield, Clock } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { data: dbProducts = [], isLoading, error } = useProducts();
  
  // Use database products if available, otherwise fall back to static data
  const products = dbProducts.length > 0 ? dbProducts : fallbackProducts;
  
  // Get featured products (first 3)
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-deep to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Timeless <span className="text-luxury-gold">Elegance</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover our curated collection of luxury timepieces that define sophistication and precision.
            </p>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep font-semibold px-8 py-3 text-lg"
            >
              Explore Collection
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-navy-deep" />
              </div>
              <h3 className="text-xl font-semibold text-navy-deep mb-2">Premium Quality</h3>
              <p className="text-gray-600">Handcrafted timepieces with exceptional attention to detail</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-navy-deep" />
              </div>
              <h3 className="text-xl font-semibold text-navy-deep mb-2">Authentic Guarantee</h3>
              <p className="text-gray-600">100% authentic watches with manufacturer warranty</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-navy-deep" />
              </div>
              <h3 className="text-xl font-semibold text-navy-deep mb-2">Lifetime Service</h3>
              <p className="text-gray-600">Comprehensive after-sales service and maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-deep mb-4">Featured Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked timepieces that represent the pinnacle of watchmaking excellence
            </p>
          </div>

          {isLoading ? (
            <div className="text-center">Loading featured products...</div>
          ) : error ? (
            <div className="text-center text-red-600">
              Unable to load products from database, showing sample products.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/products')}
              variant="outline" 
              className="border-navy-deep text-navy-deep hover:bg-navy-deep hover:text-white"
            >
              View All Products
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-deep mb-4">What Our Customers Say</h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.8/5 based on 127 reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
