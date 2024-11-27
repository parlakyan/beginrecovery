import { Shield } from 'lucide-react';

const InsuranceSection = () => {
  const insuranceProviders = [
    { name: 'Aetna', logo: '/insurance/aetna.svg' },
    { name: 'Blue Cross Blue Shield', logo: '/insurance/bcbs.svg' },
    { name: 'Cigna', logo: '/insurance/cigna.svg' },
    { name: 'United Healthcare', logo: '/insurance/united.svg' },
    { name: 'Humana', logo: '/insurance/humana.svg' },
    { name: 'Kaiser Permanente', logo: '/insurance/kaiser.svg' }
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Choose Your Insurance
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We work with major insurance providers to ensure you get the care you need.
            Browse our network of accepted insurance plans.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {insuranceProviders.map((provider) => (
            <div
              key={provider.name}
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <img
                src={provider.logo}
                alt={`${provider.name} logo`}
                className="h-12 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceSection;
