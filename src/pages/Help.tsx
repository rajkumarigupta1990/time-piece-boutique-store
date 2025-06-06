
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ContactForm } from '@/types';

const Help = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const faqs = [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unworn watches with original packaging and documentation."
    },
    {
      question: "Do you provide international shipping?",
      answer: "Yes, we ship internationally to over 15 countries. Shipping costs and delivery times vary by location."
    },
    {
      question: "Are all watches authentic?",
      answer: "Absolutely. Every watch comes with a certificate of authenticity and manufacturer's warranty."
    },
    {
      question: "Do you offer watch servicing?",
      answer: "Yes, we provide professional servicing for all brands we sell through our certified technicians."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and EMI options through Razorpay."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email and SMS to monitor delivery."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-navy-deep text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">How Can We Help?</h1>
          <p className="text-xl text-gray-300">
            Get in touch with our expert team for any questions or assistance.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-navy-deep mb-8">Get in Touch</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center">
                <Phone className="w-6 h-6 text-luxury-gold mr-4" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-gray-600">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-luxury-gold mr-4" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600">support@timepieceboutique.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-6 h-6 text-luxury-gold mr-4" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-gray-600">123 Jewelry District, Mumbai, Maharashtra 400001</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-luxury-gold mr-4" />
                <div>
                  <p className="font-semibold">Business Hours</p>
                  <p className="text-gray-600">Mon - Sat: 10:00 AM - 8:00 PM</p>
                  <p className="text-gray-600">Sunday: 11:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-2xl font-bold text-navy-deep mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 border border-border">
                    <h4 className="font-semibold text-navy-deep mb-2">{faq.question}</h4>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 border border-border">
              <h3 className="text-2xl font-bold text-navy-deep mb-6">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="product">Product Question</SelectItem>
                      <SelectItem value="order">Order Support</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="return">Returns & Exchanges</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide details about your inquiry..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-navy-deep"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
