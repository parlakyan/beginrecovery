import React from 'react';
import { Award } from 'lucide-react';

const certifications = [
  {
    name: 'Joint Commission Accredited',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=100&h=100',
    description: 'Meets highest standards of care and safety'
  },
  {
    name: 'LegitScript Certified',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=100&h=100',
    description: 'Verified addiction treatment provider'
  },
  {
    name: 'NAATP Member',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=100&h=100',
    description: 'National Association of Addiction Treatment Providers'
  },
  {
    name: 'State Licensed',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=100&h=100',
    description: 'Licensed by the State Department of Health Care Services'
  }
];

export default function CertificationsSection() {
  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <Award className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Certifications & Licenses</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {certifications.map((cert, index) => (
          <div key={index} className="text-center">
            <img
              src={cert.logo}
              alt={cert.name}
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
            <p className="text-sm text-gray-600">{cert.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}