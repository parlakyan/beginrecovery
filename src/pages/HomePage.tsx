import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import CoreValues from '../components/CoreValues';
import TreatmentFinder from '../components/TreatmentFinder';
import LocationBrowser from '../components/LocationBrowser';
import { useTitle } from '../hooks/useTitle';

export default function HomePage() {
  useTitle('Find Trusted Rehabilitation Centers', 
    'Discover and connect with verified rehabilitation centers and treatment facilities across the United States.'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />

        {/* Treatment Finder */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <TreatmentFinder />
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <CoreValues />
          </div>
        </section>

        {/* Location Browser */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <LocationBrowser />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
