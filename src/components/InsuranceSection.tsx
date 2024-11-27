import { Shield } from 'lucide-react';

const insuranceProviders = [
  { 
    name: 'Aetna',
    logo: '/insurance/aetna.svg',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:border-red-300'
  },
  { 
    name: 'Blue Cross Blue Shield',
    logo: '/insurance/bcbs.svg',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:border-blue-300'
  },
  { 
    name: 'Cigna',
    logo: '/insurance/cigna.svg',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverColor: 'hover:border-teal-300'
  },
  { 
    name: 'United Healthcare',
    logo: '/insurance/united.svg',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:border-orange-300'
  },
  { 
    name: 'Humana',
    logo: '/insurance/humana.svg',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:border-green-300'
  },
  { 
    name: 'Kaiser Permanente',
    logo: '/insurance/kaiser.svg',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:border-purple-300'
  }
];

const InsuranceSection = () => {
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
              className={`flex items-center justify-center p-6 rounded-lg border-2 transition-all ${provider.bgColor} ${provider.borderColor} ${provider.hoverColor} hover:shadow-lg`}
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
