import { Shield, Building2, Stethoscope, Heart, Activity, Building, User } from 'lucide-react';

const insuranceProviders = [
  { 
    icon: Building2,
    name: 'Aetna',
    description: 'Health Insurance',
    iconColor: 'text-red-600'
  },
  { 
    icon: Stethoscope,
    name: 'Blue Cross',
    description: 'Blue Shield',
    iconColor: 'text-blue-600'
  },
  { 
    icon: Heart,
    name: 'Cigna',
    description: 'Healthcare',
    iconColor: 'text-teal-600'
  },
  { 
    icon: Activity,
    name: 'United',
    description: 'Healthcare',
    iconColor: 'text-orange-600'
  },
  { 
    icon: Building,
    name: 'Humana',
    description: 'Insurance',
    iconColor: 'text-green-600'
  },
  { 
    icon: User,
    name: 'Kaiser',
    description: 'Permanente',
    iconColor: 'text-purple-600'
  }
];

const InsuranceSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Insurance Coverage</h2>
            <p className="text-gray-900">We accept all major insurance providers</p>
          </div>
          <a 
            href="#all-insurance" 
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            All Insurance
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {insuranceProviders.map((provider, index) => (
            <button 
              key={index}
              className="group p-8 rounded-2xl transition-all duration-200 bg-surface hover:bg-surface-hover text-center md:text-left"
            >
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300">
                <provider.icon className={`w-8 h-8 ${provider.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{provider.name}</h3>
              <p className="text-gray-900">{provider.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceSection;
