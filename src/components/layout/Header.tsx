import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Calendar, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close menu when location changes (page navigation)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Doctors', path: '/doctors', icon: Stethoscope },
    { name: 'Services', path: '/services', icon: null },
    { name: 'Symptom Checker', path: '/symptom-checker', icon: null },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: null },
    { name: 'Contact', path: '/contact', icon: null }
  ];

  return (
    <>
      {/* Premium Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800 text-white py-2 md:py-3 px-3 md:px-4 text-xs sm:text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 animate-pulse"></div>
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-2 lg:space-y-0 relative z-10">
          {/* Hide on extra small devices */}
          <div className="hidden xs:flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 lg:space-x-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
              <span className="font-medium truncate text-xs sm:text-sm">Emergency: 102</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-xs sm:text-sm truncate">info@carehospital.in</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm truncate">Sector 12, New Delhi</span>
          </div>
        </div>
      </div>

      {/* Enhanced Main Header */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${
  isScrolled 
    ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-100' 
    : 'bg-transparent'
}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Premium Logo - Responsive sizing */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4 group" aria-label="Care Hospital">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">C</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-0 sm:space-y-1">
                <h1 className={`text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Care Hospital
                </h1>
                <p className={`text-xs md:text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-blue-600' : 'text-blue-200'
                } hidden sm:block`}>
                  Excellence in Healthcare
                </p>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation - Hide on small screens */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1 px-2 xl:px-4 py-2 xl:py-2.5 rounded-xl font-medium transition-all duration-300 text-sm xl:text-base ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                        : isScrolled 
                          ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                          : 'text-white hover:text-blue-200 hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    {item.icon && <item.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Enhanced CTA Button - Hidden on mobile */}
            <div className="hidden lg:block">
              <Button 
                asChild
                size="sm"
                className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 hover:from-emerald-700 hover:via-emerald-800 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-xl px-4 xl:px-6 py-2 xl:py-3 font-semibold text-xs xl:text-sm border-0 hover:scale-105"
              >
                <Link to="/appointments" className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  <span>Book Appointment</span>
                </Link>
              </Button>
            </div>

            {/* Enhanced Mobile Menu Button - Improved visibility with stronger contrast */}
            <button
              className={`lg:hidden p-2 sm:p-3 rounded-xl transition-all duration-300 touch-manipulation ${
                isMenuOpen 
                  ? 'bg-blue-600' 
                  : isScrolled 
                    ? 'bg-blue-600 shadow-md' 
                    : 'bg-blue-600 shadow-lg'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Enhanced Mobile Menu - Full screen with animations */}
          {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 top-[calc(4rem+theme(spacing.8))] bg-gradient-to-br from-blue-800 via-blue-900 to-emerald-900 shadow-2xl z-40 flex flex-col animate-in slide-in-from-top duration-300">
              <nav className="flex flex-col overflow-y-auto flex-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-3 px-6 py-5 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white border-r-4 border-white' 
                          : 'bg-blue-700/40 text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-emerald-700 border-b border-blue-600/30'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon ? (
                        <item.icon className="w-5 h-5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{item.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              {/* Mobile CTA button - always visible at bottom */}
              <div className="p-6 border-t border-blue-700/50 mt-auto">
                <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-xl shadow-lg py-6 text-base">
                  <Link to="/appointments" className="flex items-center justify-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Book Appointment</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Add padding to account for fixed header */}
      <div className="h-28 md:h-32"></div>
    </>
  );
};

export default Header;
