import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { Doctor, listenToDoctors } from '@/services/firebase';

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Use the real-time listener instead of one-time fetch
    const unsubscribe = listenToDoctors((doctorsData) => {
      try {
        // Sort doctors by availability and rating
        const sortedDoctors = doctorsData.sort((a, b) => {
          // First sort by availability
          if (a.availableToday && !b.availableToday) return -1;
          if (!a.availableToday && b.availableToday) return 1;
          // Then by rating
          return (b.rating || 0) - (a.rating || 0);
        });
        
        setDoctors(sortedDoctors);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error processing doctors data:", err);
        setError("Failed to process doctors data");
        setLoading(false);
      }
    });
    
    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []); // No dependencies needed as we're using a real-time listener

  // Use the first 4 doctors for display
  const displayDoctors = doctors.slice(0, 4);

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => setLoading(true)} className="inline-flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <Badge className="bg-green-100 text-green-800 px-4 py-2 mb-4">
            Meet Our Experts
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            Our Distinguished Doctors
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our team of world-renowned physicians brings decades of experience and expertise 
            to provide you with the highest quality medical care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {displayDoctors.length > 0 ? (
            displayDoctors.map((doctor) => (
              <Card key={doctor.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src={doctor.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'} 
                    alt={doctor.name}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    {doctor.availableToday ? (
                      <Badge className="bg-green-500 text-white text-xs">Available Today</Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white text-xs">Busy</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-semibold text-gray-900">{doctor.rating}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 sm:mb-2">{doctor.name}</h3>
                  <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                      {doctor.specialty}
                    </Badge>
                    <span className="text-xs text-gray-500">{doctor.experience}</span>
                  </div>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">
                    {doctor.bio}
                  </p>
                  
                  <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-5">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{doctor.location}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {doctor.education}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm py-1.5 sm:py-2"
                    disabled={!doctor.availableToday}
                    asChild
                  >
                    <Link to="/appointments">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {doctor.availableToday ? 'Book Appointment' : 'Schedule Later'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-10">
              <p className="text-gray-500">No doctors available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <Button variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50" asChild>
            <Link to="/doctors">View All Doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
