
import React from 'react';
import { Award, Users, Globe, Heart } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Years of Excellence', value: '25+' },
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Luxury Brands', value: '50+' },
    { label: 'Countries Served', value: '15+' },
  ];

  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards in every timepiece we offer, ensuring each watch meets our rigorous quality criteria.'
    },
    {
      icon: Users,
      title: 'Trust',
      description: 'Built on decades of customer satisfaction, we pride ourselves on transparent business practices and authentic products.'
    },
    {
      icon: Globe,
      title: 'Heritage',
      description: 'Our passion for horological artistry spans generations, connecting traditional craftsmanship with modern innovation.'
    },
    {
      icon: Heart,
      title: 'Service',
      description: 'From purchase to after-sales support, we provide personalized service that exceeds expectations.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-navy-deep text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Our <span className="text-luxury-gold">Story</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            For over 25 years, TimePiece Boutique has been India's premier destination for luxury timepieces, 
            combining traditional horological expertise with modern retail excellence.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-luxury-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy-deep mb-6">A Legacy of Time</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Founded in 1999 by master horologist Rajesh Gupta, TimePiece Boutique began as a small 
                  workshop in Mumbai's jewelry district. What started as a passion for mechanical timepieces 
                  has evolved into India's most trusted luxury watch retailer.
                </p>
                <p>
                  Our journey has been guided by three core principles: authenticity, excellence, and service. 
                  Every timepiece in our collection is carefully selected and authenticated by our team of 
                  certified horologists, ensuring our customers receive only the finest watches.
                </p>
                <p>
                  Today, we proudly serve customers across India and internationally, offering an unparalleled 
                  selection of luxury timepieces from the world's most prestigious manufacturers.
                </p>
              </div>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="/placeholder.svg" 
                alt="Our workshop" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-deep mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do, from curating our collection to serving our customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <value.icon className="w-8 h-8 text-luxury-gold" />
                </div>
                <h3 className="text-xl font-semibold text-navy-deep mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-deep mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our passionate team of horologists and customer service specialists are here to help you find the perfect timepiece.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rajesh Gupta', role: 'Founder & Master Horologist', image: '/placeholder.svg' },
              { name: 'Priya Sharma', role: 'Head of Customer Experience', image: '/placeholder.svg' },
              { name: 'Amit Patel', role: 'Technical Specialist', image: '/placeholder.svg' }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gray-200">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-navy-deep">{member.name}</h3>
                <p className="text-luxury-gold">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
