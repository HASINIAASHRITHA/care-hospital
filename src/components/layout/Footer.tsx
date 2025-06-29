import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Heart,
  Shield,
  Award,
  Users,
  Calendar,
  Stethoscope
} from 'lucide-react';

const Footer = () => {
  // Define social media icons as an array
  const socialIcons = [
    { icon: Facebook, color: 'hover:bg-blue-600', label: 'Facebook' },
    { icon: Instagram, color: 'hover:bg-pink-600', label: 'Instagram' },
    { icon: Twitter, color: 'hover:bg-blue-400', label: 'Twitter' },
    { icon: Youtube, color: 'hover:bg-red-600', label: 'YouTube' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Enhanced About Section */}
          <div className="space-y-4 md:space-y-6 col-span-1 xs:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-xl md:text-2xl">C</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold">Care Hospital</h3>
                <p className="text-blue-300 text-xs sm:text-sm font-medium">Excellence in Healthcare</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              India's leading healthcare provider committed to delivering world-class medical services. 
              With cutting-edge technology and compassionate care, we prioritize your health and wellbeing above all.
            </p>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="flex items-center space-x-1 md:space-x-2 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-full">
                <Shield className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                <span className="text-xs font-medium">NABH Certified</span>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-full">
                <Award className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
                <span className="text-xs font-medium">ISO 9001:2015</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg md:text-xl font-bold text-blue-200 flex items-center space-x-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span>Quick Access</span>
            </h4>
            <div className="grid grid-cols-1 gap-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Our Services', path: '/services' },
                { name: 'Expert Doctors', path: '/doctors' },
                { name: 'Book Appointment', path: '/appointments' },
                { name: 'Patient Portal', path: '/portal' },
                { name: 'Contact Us', path: '/contact' }
              ].map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className="block text-gray-300 hover:text-blue-300 transition-all duration-300 text-xs sm:text-sm group flex items-center space-x-2"
                >
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:bg-blue-300 transition-colors duration-300"></div>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Enhanced Contact Info */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg md:text-xl font-bold text-blue-200 flex items-center space-x-2">
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
              <span>Contact Info</span>
            </h4>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm md:text-base font-semibold">Emergency Hotline</div>
                    <div className="text-red-300 text-xs sm:text-sm">24/7 Available</div>
                  </div>
                </div>
                <div className="text-gray-300 text-xs sm:text-sm space-y-1">
                  <div className="font-medium">Emergency: 102</div>
                  <div>General: +91 11 2345 6789</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300 text-xs sm:text-sm">info@carehospital.in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 text-xs sm:text-sm">Sector 12, New Delhi - 110001</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Hours & Services */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg md:text-xl font-bold text-blue-200 flex items-center space-x-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              <span>Operating Hours</span>
            </h4>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-xs sm:text-sm">Emergency Ward</span>
                    <span className="text-red-300 text-xs font-semibold bg-red-500/20 px-2 py-1 rounded-full">24/7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-xs sm:text-sm">OPD Services</span>
                    <span className="text-blue-300 text-xs sm:text-sm font-semibold">9AM - 8PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-xs sm:text-sm">Laboratory</span>
                    <span className="text-emerald-300 text-xs sm:text-sm font-semibold">7AM - 10PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-xs sm:text-sm">Pharmacy</span>
                    <span className="text-purple-300 text-xs sm:text-sm font-semibold">8AM - 9PM</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-emerald-500/20">
                <h5 className="text-xs sm:text-sm font-bold text-emerald-200 mb-2 md:mb-3 flex items-center space-x-2">
                  <Heart className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Insurance Partners</span>
                </h5>
                <div className="text-2xs xs:text-xs text-gray-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>CGHS • ECHS • ESI</span>
                    <span className="text-emerald-300">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cashless Treatment</span>
                    <span className="text-emerald-300">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>All Major Insurance</span>
                    <span className="text-emerald-300">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Social Media & Bottom Section */}
        <div className="border-t border-gray-700/50 mt-10 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div className="flex space-x-3 md:space-x-4">
              {socialIcons.map(({ icon: Icon, color, label }) => (
                <div 
                  key={label}
                  className={`w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center ${color} cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg border border-white/20`}
                  title={label}
                  role="button"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              ))}
            </div>
            
            <div className="text-center lg:text-right">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">
                © 2024 Care Hospital. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-end items-center gap-x-3 md:gap-x-4 gap-y-1 text-2xs xs:text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" />
                  <span>NABH Accredited</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400" />
                  <span>ISO 9001:2015</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Stethoscope className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
                  <span>JCI Certified</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
