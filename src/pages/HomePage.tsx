import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturedCarousel from '../components/FeaturedCarousel';
import CoreValues from '../components/CoreValues';
import TreatmentFinder from '../components/TreatmentFinder';
import InsuranceChecker from '../components/InsuranceChecker';

export default function HomePage() {
  const [featuredFacilities, setFeaturedFacilities] = useState<Facility[]>([]);
  const [recentFacilities, setRecentFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const [featured, recent] = await Promise.all([
          facilitiesService.getFeaturedFacilities(),
          facilitiesService.getFacilities()
        ]);

        setFeaturedFacilities(featured);
        setRecentFacilities(recent);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Treatment Centers */}
        {featuredFacilities.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Featured Treatment Centers
              </h2>
              <FeaturedCarousel facilities={featuredFacilities} />
            </div>
          </section>
        )}

        {/* Recent Treatment Centers */}
        {recentFacilities.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Recent Treatment Centers
              </h2>
              <FeaturedCarousel facilities={recentFacilities} />
            </div>
          </section>
        )}

        {/* Core Values */}
        <CoreValues />

        {/* Treatment Finder */}
        <TreatmentFinder />

        {/* Insurance Checker */}
        <InsuranceChecker />
      </main>

      <Footer />
    </div>
  );
}
