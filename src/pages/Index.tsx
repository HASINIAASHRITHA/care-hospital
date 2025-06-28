
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Doctors from '@/components/home/Doctors';
import Features from '@/components/home/Features';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Services />
        <Doctors />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
