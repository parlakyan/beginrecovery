import React from 'react';
import { Shield, Check } from 'lucide-react';

const insuranceProviders = [
  {
    name: 'Blue Cross Blue Shield',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=200&h=100',
    coverage: ['Full coverage available', 'In-network provider', 'Verification required']
  },
  {
    name: 'Aetna',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=200&h=100',
    coverage: ['Partial coverage', 'Out-of-network provider', 'Pre-authorization needed']
  },
  {
    name: 'UnitedHealthcare',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=200&h=100',
    coverage: ['Full coverage available', 'In-network provider', 'Benefits verification']
  },
  {
    name: 'Cigna',
    logo: 'https://images.unsplash.com/photo-1635870723802-e88d76ae324e?auto=format&fit=crop&q=80&w=200&h=100',
    coverage: ['Coverage varies', 'Network-based coverage', 'Prior authorization']
  }
];

export default function InsuranceSection() {
  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Insurance Coverage</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {insuranceProviders.map((provider, index) => (
          <div key={index} className="border rounded-xl p-6">
            <img
              src={provider.logo}
              alt={provider.name}
              className="w-32 h-16 object-contain mb-4"
            />
            <h3 className="text-lg font-semibold mb-4">{provider.name}</h3>
            <ul className="space-y-2">
              {provider.coverage.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          Don't see your insurance provider? Contact us to verify your coverage.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Verify Insurance Coverage
        </button>
      </div>
    </section>
  );
}