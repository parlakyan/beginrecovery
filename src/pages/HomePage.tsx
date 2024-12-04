import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturedCarousel from '../components/FeaturedCarousel';
import LocationBrowser from '../components/LocationBrowser';
import CoreValues from '../components/CoreValues';
import TreatmentFinder from '../components/TreatmentFinder';
import InsuranceChecker from '../components/InsuranceChecker';
import MapSection from '../components/MapSection';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';

export default function HomePage() {
  const [featuredFacilities, setFeaturedFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    const fetchFeaturedFacilities = async () => {
      try {
        const facilities = await facilitiesService.getFeaturedFacilities();
        setFeaturedFacilities(facilities);
      } catch (error) {
        console.error('Error fetching featured facilities:', error);
      }
    };

    fetchFeaturedFacilities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Treatment Finder */}
      <TreatmentFinder />

      {/* Featured Treatment Centers */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Treatment Centers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover top-rated rehabilitation facilities that provide comprehensive care and support
            </p>
          </div>
          <FeaturedCarousel facilities={featuredFacilities} />
        </div>
      </section>

      {/* Browse by Location */}
      <LocationBrowser />

      {/* Insurance Checker */}
      <InsuranceChecker />

      {/* Map Section */}
      <MapSection />

      {/* Core Values */}
      <CoreValues />

      <Footer />
    </div>
  );
}
