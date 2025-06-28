
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Baby, Eye, Bone, Stethoscope, Activity, Shield, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      icon: Heart,
      title: 'Cardiology',
      description: 'Advanced heart care with experienced cardiologists. ECG, Echo, Angioplasty services available.',
      features: ['24/7 Emergency Care', 'Heart Surgery', 'Preventive Checkups'],
      price: 'Starting from ₹500',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Brain,
      title: 'Neurology',
      description: 'Expert neurological care for brain and nervous system disorders.',
      features: ['Stroke Treatment', 'Epilepsy Care', 'Memory Disorders'],
      price: 'Starting from ₹800',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Baby,
      title: 'Pediatrics',
      description: 'Comprehensive child healthcare from newborn to adolescent care.',
      features: ['Vaccination', 'Growth Monitoring', 'Child Psychology'],
      price: 'Starting from ₹300',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Eye,
      title: 'Ophthalmology',
      description: 'Complete eye care including LASIK, cataract surgery, and routine checkups.',
      features: ['Cataract Surgery', 'LASIK', 'Retina Treatment'],
      price: 'Starting from ₹400',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Bone,
      title: 'Orthopedics',
      description: 'Bone, joint, and muscle care with advanced surgical procedures.',
      features: ['Joint Replacement', 'Sports Injuries', 'Arthritis Care'],
      price: 'Starting from ₹600',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Stethoscope,
      title: 'General Medicine',
      description: 'Primary healthcare for common illnesses and preventive care.',
      features: ['Health Checkups', 'Chronic Disease Care', 'Diabetes Management'],
      price: 'Starting from ₹200',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const facilities = [
    { icon: Activity, title: 'ICU & Emergency', description: '24/7 critical care with modern equipment' },
    { icon: Shield, title: 'Pharmacy', description: 'In-house pharmacy with all medicines' },
    { icon: Clock, title: 'Lab Services', description: 'Digital reports within 2-4 hours' },
    { icon: Users, title: 'OPD Services', description: 'Specialist consultations daily' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-orange-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Comprehensive Healthcare Services
            </h1>
            <p className="text-xl text-orange-100 leading-relaxed mb-8">
              Providing quality healthcare services with affordable pricing for all Indians. 
              From preventive care to specialized treatments, we're here for your health journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white text-lg py-2 px-4">NABH Accredited</Badge>
              <Badge className="bg-white/20 text-white text-lg py-2 px-4">Insurance Accepted</Badge>
              <Badge className="bg-white/20 text-white text-lg py-2 px-4">24/7 Emergency</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Medical Services
            </h2>
            <p className="text-xl text-gray-600">
              Expert care across all specialties with transparent pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className={`${service.bgColor} p-6 text-center`}>
                    <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <service.icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-700 text-sm">{service.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Services Include:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600">{service.price}</div>
                      <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600">
                        <Link to="/appointments">Book Now</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hospital Facilities
            </h2>
            <p className="text-xl text-gray-600">
              Modern infrastructure for better healthcare delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center">
                    <facility.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{facility.title}</h3>
                  <p className="text-gray-600 text-sm">{facility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
