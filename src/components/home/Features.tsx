
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Clock, Award, Heart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Advanced Safety Protocols',
      description: 'State-of-the-art safety measures and infection control protocols to ensure patient wellbeing.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Clock,
      title: '24/7 Emergency Care',
      description: 'Round-the-clock emergency services with rapid response times and expert medical staff.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Award,
      title: 'Award-Winning Care',
      description: 'Recognized excellence in healthcare delivery with multiple national and international awards.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Heart,
      title: 'Compassionate Service',
      description: 'Patient-centered care approach focusing on comfort, dignity, and personalized treatment plans.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Care Hospital?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We combine cutting-edge medical technology with compassionate care to deliver 
              exceptional healthcare experiences that put patients first.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=700&fit=crop"
                alt="Modern hospital interior"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
            </div>
            
            {/* Floating Stats Cards */}
            <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">99.8%</div>
              <div className="text-sm text-gray-600">Patient Satisfaction</div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">50K+</div>
              <div className="text-sm text-gray-600">Lives Saved</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
