import React from 'react';
import { Shield, Heart, Users, Star } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Licensed & Accredited',
    description: 'All centers are verified and meet strict quality standards'
  },
  {
    icon: Heart,
    title: 'Personalized Care',
    description: 'Treatment plans tailored to your specific needs'
  },
  {
    icon: Users,
    title: 'Family Support',
    description: 'Comprehensive support for patients and their loved ones'
  },
  {
    icon: Star,
    title: 'Success Stories',
    description: 'Thousands of individuals have found their path to recovery'
  }
];

export default function CoreValues() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're committed to helping you find the right treatment center for your journey to recovery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {values.map((Value, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Value.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{Value.title}</h3>
              <p className="text-gray-600">{Value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}