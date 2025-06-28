
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Calendar, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Doctors', path: '/doctors', icon: Stethoscope },
    { name: 'Services', path: '/services', icon: null },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Portal', path: '/portal', icon: null },
    { name: 'Contact', path: '/contact', icon: null }
  ];

  return (
    <>
      {/* Premium Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800 text-white py-3 px-4 text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 animate-pulse"></div>
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-2 lg:space-y-0 relative z-10">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Phone className="w-4 h-4 text-red-400" />
              <span className="font-medium">Emergency: 102 | +91 11 2345 6789</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>info@carehospital.in</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Sector 12, New Delhi - 110001</span>
          </div>
        </div>
      </div>

      {/* Enhanced Main Header */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-100' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Premium Logo */}
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">C</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-1">
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Care Hospital
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-blue-600' : 'text-blue-200'
                }`}>
                  Excellence in Healthcare
                </p>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                        : isScrolled 
                          ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                          : 'text-white hover:text-blue-200 hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Enhanced CTA Button */}
            <div className="hidden lg:block">
              <Button 
                asChild
                className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 hover:from-emerald-700 hover:via-emerald-800 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-xl px-6 py-3 font-semibold text-sm border-0 hover:scale-105"
              >
                <Link to="/appointments" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </Link>
              </Button>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <button
              className={`lg:hidden p-3 rounded-xl transition-all duration-300 ${
                isScrolled 
                  ? 'bg-gray-100 hover:bg-gray-200' 
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
              )}
            </button>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl mt-4 mb-4 overflow-hidden border border-gray-100">
              <div className="py-4">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-3 px-6 py-4 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-emerald-50 text-blue-700 border-r-4 border-blue-500' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                <div className="px-6 py-4 border-t border-gray-100 mt-2">
                  <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 rounded-xl shadow-lg">
                    <Link to="/appointments" className="flex items-center justify-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
