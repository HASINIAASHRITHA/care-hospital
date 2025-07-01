import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Doctor, listenToDoctors } from '@/services/firebase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Phone, Clock, GraduationCap, Award, Search } from 'lucide-react';

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>(['All']);
  
  // Fetch doctors from Firebase
  useEffect(() => {
    setLoading(true);
    
    // Use the real-time listener to get doctor data
    const unsubscribe = listenToDoctors((doctorsData) => {
      setDoctors(doctorsData);
      
      // Extract unique specialties from doctor data
      const specialtySet = new Set<string>(['All']);
      doctorsData.forEach(doctor => {
        if (doctor.specialty) {
          specialtySet.add(doctor.specialty);
        }
      });
      
      setSpecialties(Array.from(specialtySet));
      setLoading(false);
    });
    
    // Clean up listener on component unmount
    return () => unsubscribe();
  }, []);

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
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredDoctors.length > 0 ? filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden rounded-2xl">
                  <div className="relative overflow-hidden">
                    <img 
                      src={doctor.image || '/placeholder-doctor.jpg'} 
                      alt={doctor.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-doctor.jpg';
                      }}
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
                        <span className="text-xs text-gray-600">reviews</span>
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
                        <span className="text-lg font-bold text-emerald-600">{(doctor as any).consultationFee || 'Consultation fee unavailable'}</span>
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
                        <span>Next: {(doctor as any).nextAvailable || 'Not available'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={!doctor.availableToday}
                        asChild
                      >
                        <Link to={`/appointments?doctor=${doctor.name}&department=${doctor.specialty}`}>
                          <Calendar className="w-4 h-4 mr-2" />
                          {doctor.availableToday ? 'Book Now' : 'Schedule'}
                        </Link>
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
              )) : (
                <div className="col-span-full text-center py-16">
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Doctors;
