
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Services = () => {
  const services = [
    {
      icon: '🫀',
      title: 'Cardiology',
      description: 'Advanced heart care with state-of-the-art cardiac facilities and expert cardiologists.',
      features: ['ECG', 'Echocardiography', 'Cardiac Surgery'],
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: '🧠',
      title: 'Neurology',
      description: 'Comprehensive brain and nervous system care with cutting-edge neurological treatments.',
      features: ['MRI Scanning', 'Stroke Care', 'Neurosurgery'],
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: '🦴',
      title: 'Orthopedics',
      description: 'Expert bone, joint, and muscle care with minimally invasive surgical techniques.',
      features: ['Joint Replacement', 'Sports Medicine', 'Trauma Care'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '👶',
      title: 'Pediatrics',
      description: 'Specialized healthcare for children with a child-friendly environment.',
      features: ['Vaccination', 'Growth Monitoring', 'Pediatric Surgery'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '👁️',
      title: 'Ophthalmology',
      description: 'Complete eye care services with advanced diagnostic and surgical capabilities.',
      features: ['LASIK Surgery', 'Cataract Surgery', 'Retina Care'],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '🫁',
      title: 'Pulmonology',
      description: 'Respiratory care specialists treating lung and breathing disorders.',
      features: ['Lung Function Tests', 'Sleep Studies', 'Bronchoscopy'],
      color: 'from-teal-500 to-green-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-4">
            Our Specialties
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            World-Class Medical Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We offer comprehensive healthcare services across multiple specialties, 
            combining expertise with compassionate care to ensure the best outcomes for our patients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-0 shadow-lg"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-2 transform duration-300">
                    Learn More →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
