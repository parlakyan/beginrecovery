import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';

const insuranceProviders = [
  {
    name: 'United Healthcare',
    logo: 'https://raw.githubusercontent.com/recovery-org/assets/main/logos/united-healthcare-logo.png',
    bgColor: 'bg-blue-50'
  },
  {
    name: 'Aetna',
    logo: 'https://raw.githubusercontent.com/recovery-org/assets/main/logos/aetna-logo.png',
    bgColor: 'bg-purple-50'
  },
  {
    name: 'Anthem',
    logo: 'https://raw.githubusercontent.com/recovery-org/assets/main/logos/anthem-logo.png',
    bgColor: 'bg-blue-50'
  },
  {
    name: 'Humana',
    logo: 'https://raw.githubusercontent.com/recovery-org/assets/main/logos/humana-logo.png',
    bgColor: 'bg-green-50'
  },
  {
    name: 'Medicaid',
    logo: 'https://raw.githubusercontent.com/recovery-org/assets/main/logos/medicaid-logo.png',
    bgColor: 'bg-blue-50'
  }
];

export default function InsuranceChecker() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Choose Your Insurance</h2>
            <p className="text-gray-600">Insurance covers addiction and mental health treatment.</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            All Insurance Providers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {insuranceProviders.map((provider, index) => (
            <button 
              key={index}
              className={`group p-6 rounded-2xl transition-all duration-200 ${provider.bgColor} hover:shadow-lg`}
            >
              <div className="h-12 flex items-center justify-center mb-4">
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Treatment Covered By {provider.name}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-12 max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Verify Your Coverage</h3>
            </div>
            <div className="space-y-4">
              <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select your insurance provider</option>
                {insuranceProviders.map((provider, index) => (
                  <option key={index} value={provider.name}>{provider.name}</option>
                ))}
              </select>
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 group">
                Check Coverage
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}