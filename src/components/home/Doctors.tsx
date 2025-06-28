
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar } from 'lucide-react';

const Doctors = () => {
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      experience: '15 years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      education: 'Harvard Medical School',
      location: 'Cardiology Wing',
      availableToday: true,
      bio: 'Leading expert in interventional cardiology with extensive experience in complex cardiac procedures.'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      experience: '12 years',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      education: 'Johns Hopkins University',
      location: 'Neurology Department',
      availableToday: false,
      bio: 'Specialist in stroke treatment and neurological disorders with focus on innovative therapies.'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrician',
      experience: '10 years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1594824735997-40b05fe86db8?w=400&h=400&fit=crop&crop=face',
      education: 'Stanford Medical School',
      location: 'Children\'s Wing',
      availableToday: true,
      bio: 'Dedicated pediatrician committed to providing comprehensive healthcare for children and adolescents.'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedic Surgeon',
      experience: '18 years',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      education: 'Mayo Clinic',
      location: 'Orthopedic Center',
      availableToday: true,
      bio: 'Expert in joint replacement surgery and sports medicine with minimally invasive techniques.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="bg-green-100 text-green-800 px-4 py-2 mb-4">
            Meet Our Experts
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Distinguished Doctors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our team of world-renowned physicians brings decades of experience and expertise 
            to provide you with the highest quality medical care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={doctor.image} 
                  alt={doctor.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  {doctor.availableToday ? (
                    <Badge className="bg-green-500 text-white">Available Today</Badge>
                  ) : (
                    <Badge className="bg-gray-500 text-white">Busy</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">{doctor.rating}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {doctor.specialty}
                  </Badge>
                  <span className="text-sm text-gray-500">{doctor.experience}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {doctor.bio}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {doctor.education}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  disabled={!doctor.availableToday}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {doctor.availableToday ? 'Book Appointment' : 'Schedule Later'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50">
            View All Doctors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
