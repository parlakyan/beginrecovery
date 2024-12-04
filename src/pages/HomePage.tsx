import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturedCarousel from '../components/FeaturedCarousel';
import LocationBrowser from '../components/LocationBrowser';
import CoreValues from '../components/CoreValues';
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

      {/* Featured Treatment Centers */}
      <FeaturedCarousel facilities={featuredFacilities} />

      {/* Browse by Location */}
      <LocationBrowser />

      {/* Core Values */}
      <CoreValues />

      <Footer />
    </div>
  );
}
