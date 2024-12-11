import React from 'react';
import { Activity, Brain, Pill, Home, Globe, ShieldCheck, CreditCard } from 'lucide-react';
import { Facility } from '../types';

interface FacilityDetailsSectionProps {
  facility: Facility;
}

export default function FacilityDetailsSection({ facility }: FacilityDetailsSectionProps) {
  const sections = [
    {
      title: 'Treatment Types',
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      items: facility.treatmentTypes.map(type => type.name),
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Conditions We Treat',
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      items: facility.conditions?.map(condition => condition.name) || [],
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Substances We Treat',
      icon: <Pill className="w-6 h-6 text-red-600" />,
      items: facility.substances,
      bgColor: 'bg-red-50'
    },
    {
      title: 'Therapies',
      icon: <Brain className="w-6 h-6 text-indigo-600" />,
      items: facility.therapies?.map(therapy => therapy.name) || [],
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Amenities & Services',
      icon: <Home className="w-6 h-6 text-green-600" />,
      items: facility.amenities,
      bgColor: 'bg-green-50'
    },
    {
      title: 'Languages',
      icon: <Globe className="w-6 h-6 text-cyan-600" />,
      items: facility.languages,
      bgColor: 'bg-cyan-50'
    }
  ];

  // Add verified-only sections
  if (facility.isVerified) {
    if (facility.licenses && facility.licenses.length > 0) {
      sections.push({
        title: 'Certifications & Licenses',
        icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
        items: facility.licenses.map(license => license.name),
        bgColor: 'bg-emerald-50'
      });
    }

    if (facility.insurances && facility.insurances.length > 0) {
      sections.push({
        title: 'Insurance Providers',
        icon: <CreditCard className="w-6 h-6 text-orange-600" />,
        items: facility.insurances.map(insurance => insurance.name),
        bgColor: 'bg-orange-50'
      });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Facility Details</h2>
      
      <div className="space-y-8">
        {sections.map((section, index) => (
          section.items.length > 0 && (
            <div key={index}>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className={`p-2 rounded-lg ${section.bgColor}`}>
                  {section.icon}
                </div>
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="text-gray-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
