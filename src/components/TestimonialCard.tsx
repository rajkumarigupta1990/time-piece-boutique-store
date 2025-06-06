
import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { Testimonial } from '@/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < testimonial.rating 
                  ? 'text-luxury-gold fill-current' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        {testimonial.verified && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Verified Purchase</span>
          </div>
        )}
      </div>
      
      <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
      
      <div className="flex items-center justify-between">
        <span className="font-medium text-navy-deep">{testimonial.name}</span>
        <span className="text-sm text-muted-foreground">
          {new Date(testimonial.date).toLocaleDateString('en-IN')}
        </span>
      </div>
    </div>
  );
};

export default TestimonialCard;
