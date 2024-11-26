import React from 'react';
import { Brain, Cloud, Sparkles, Zap, Apple, Heart } from 'lucide-react';

const categories = [
  {
    icon: Brain,
    name: 'Addiction',
    description: 'Rehab Centers',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    hoverColor: 'hover:bg-green-100'
  },
  {
    icon: Cloud,
    name: 'Depression',
    description: 'Treatment Providers',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    hoverColor: 'hover:bg-purple-100'
  },
  {
    icon: Sparkles,
    name: 'Anxiety',
    description: 'Treatment Providers',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    hoverColor: 'hover:bg-orange-100'
  },
  {
    icon: Zap,
    name: 'Trauma',
    description: 'Treatment Options',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    hoverColor: 'hover:bg-pink-100'
  },
  {
    icon: Apple,
    name: 'Eating Disorders',
    description: 'Treatment Centers',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    hoverColor: 'hover:bg-blue-100'
  },
  {
    icon: Heart,
    name: 'Mental Health',
    description: 'Comprehensive Care',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    hoverColor: 'hover:bg-indigo-100'
  }
];

export default function TreatmentFinder() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Find Treatment</h2>
            <p className="text-gray-600">Browse over 3,500 Treatment Providers</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            All Conditions
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <button 
              key={index}
              className={`group p-8 rounded-2xl transition-all duration-200 ${category.bgColor} ${category.hoverColor} text-center md:text-left`}
            >
              <div className={`w-16 h-16 rounded-xl ${category.bgColor} flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className={`w-8 h-8 ${category.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-600">{category.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}