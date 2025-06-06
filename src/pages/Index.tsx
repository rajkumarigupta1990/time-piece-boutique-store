
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Headphones } from 'lucide-react';
import { products } from '@/data/products';
import { testimonials } from '@/data/testimonials';
import ProductCard from '@/components/ProductCard';
import TestimonialCard from '@/components/TestimonialCard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-navy-deep to-navy-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Timeless <span className="text-luxury-gold">Elegance</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Discover our curated collection of luxury timepieces that blend traditional craftsmanship with modern precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep">
                <Link to="/products">
                  Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy-deep">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-luxury-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Authentic Guarantee</h3>
              <p className="text-gray-600">All our timepieces come with certificates of authenticity and warranty.</p>
            </div>
            <div className="text-center">
              <Truck className="h-12 w-12 text-luxury-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Complimentary shipping on all orders above ₹50,000.</p>
            </div>
            <div className="text-center">
              <Headphones className="h-12 w-12 text-luxury-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Our horologists provide personalized assistance and after-sales service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-deep mb-4">Featured Timepieces</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked selections from our premium collection, each representing the pinnacle of watchmaking excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-navy-deep">
              <Link to="/products">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-deep mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Read testimonials from our satisfied customers who have experienced the luxury of our timepieces.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-deep text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Timepiece?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of satisfied customers who trust us for their luxury watch needs.
          </p>
          <Button asChild size="lg" className="bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep">
            <Link to="/products">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
