
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Calendar, Clock, Search, Phone, Award, GraduationCap } from 'lucide-react';

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.9,
      reviews: 127,
      image: 'https://images.unsplash.com/photo-1594824735997-40b05fe86db8?w=400&h=400&fit=crop&crop=face',
      education: 'Harvard Medical School',
      location: 'Cardiology Wing - Room 201',
      availableToday: true,
      nextAvailable: 'Today 2:00 PM',
      languages: ['English', 'Spanish'],
      bio: 'Leading expert in interventional cardiology with extensive experience in complex cardiac procedures including angioplasty, stent placement, and cardiac catheterization.',
      consultationFee: '₹2,500',
      achievements: ['Best Cardiologist Award 2023', 'Published 50+ Research Papers']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      experience: '12 years',
      rating: 4.8,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      education: 'Johns Hopkins University',
      location: 'Neurology Department - Room 305',
      availableToday: false,
      nextAvailable: 'Tomorrow 10:00 AM',
      languages: ['English', 'Mandarin'],
      bio: 'Specialist in stroke treatment and neurological disorders with focus on innovative therapies and rehabilitation techniques.',
      consultationFee: '₹3,000',
      achievements: ['Neurological Excellence Award', 'International Speaker']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      education: 'Stanford Medical School',
      location: 'Children\'s Wing - Room 102',
      availableToday: true,
      nextAvailable: 'Today 3:30 PM',
      languages: ['English', 'Spanish', 'Portuguese'],
      bio: 'Dedicated pediatrician committed to providing comprehensive healthcare for children and adolescents with special focus on developmental pediatrics.',
      consultationFee: '₹2,000',
      achievements: ['Child Care Excellence Award', 'Pediatric Research Leader']
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      experience: '18 years',
      rating: 4.7,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      education: 'Mayo Clinic',
      location: 'Orthopedic Center - Room 401',
      availableToday: true,
      nextAvailable: 'Today 4:00 PM',
      languages: ['English'],
      bio: 'Expert in joint replacement surgery and sports medicine with minimally invasive techniques and rapid recovery protocols.',
      consultationFee: '₹3,500',
      achievements: ['Orthopedic Surgeon of the Year', 'Joint Replacement Specialist']
    },
    {
      id: 5,
      name: 'Dr. Priya Patel',
      specialty: 'Dermatology',
      experience: '8 years',
      rating: 4.6,
      reviews: 94,
      image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
      education: 'UCLA Medical School',
      location: 'Dermatology Suite - Room 150',
      availableToday: false,
      nextAvailable: 'Monday 9:00 AM',
      languages: ['English', 'Hindi', 'Gujarati'],
      bio: 'Comprehensive dermatological care including medical, surgical, and cosmetic dermatology with focus on skin cancer prevention.',
      consultationFee: '₹2,200',
      achievements: ['Dermatology Innovation Award', 'Cosmetic Excellence Certificate']
    },
    {
      id: 6,
      name: 'Dr. Robert Kim',
      specialty: 'Ophthalmology',
      experience: '14 years',
      rating: 4.8,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
      education: 'Duke University',
      location: 'Eye Care Center - Room 250',
      availableToday: true,
      nextAvailable: 'Today 1:15 PM',
      languages: ['English', 'Korean'],
      bio: 'Advanced eye care specialist in LASIK surgery, cataract surgery, and retinal diseases with state-of-the-art surgical techniques.',
      consultationFee: '₹2,800',
      achievements: ['Vision Care Excellence Award', 'LASIK Surgery Expert']
    }
  ];

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Ophthalmology'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-white leading-tight">
              World-Class
              <span className="block bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                Medical Experts
              </span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Connect with India's finest doctors and specialists. Experience premium healthcare 
              with personalized treatment plans and cutting-edge medical technology.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Search Section */}
      <section className="py-12 bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full lg:w-64 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Premium Doctors Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="relative overflow-hidden">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-6 right-6">
                    {doctor.availableToday ? (
                      <Badge className="bg-emerald-500 text-white px-3 py-1 shadow-lg">
                        Available Today
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white px-3 py-1 shadow-lg">
                        Busy Today
                      </Badge>
                    )}
                  </div>
                  
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-gray-900">{doctor.rating}</span>
                      <span className="text-xs text-gray-600">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 px-3 py-1">
                        {doctor.specialty}
                      </Badge>
                      <span className="text-lg font-bold text-emerald-600">{doctor.consultationFee}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    {doctor.bio}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{doctor.education}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>{doctor.experience} Experience</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>Next: {doctor.nextAvailable}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Languages
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Achievements
                    </div>
                    <div className="space-y-1">
                      {doctor.achievements.map((achievement, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center">
                          <Award className="w-3 h-3 text-yellow-600 mr-2" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!doctor.availableToday}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {doctor.availableToday ? 'Book Now' : 'Schedule'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-4 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredDoctors.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-500 text-xl mb-4">No doctors found matching your criteria</div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('all');
                }}
                className="px-8 py-3 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500 transition-all duration-300"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Doctors;
