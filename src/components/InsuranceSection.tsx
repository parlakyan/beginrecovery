import { Shield, Building2, Stethoscope, Heart, Activity, Building, User } from 'lucide-react';

const insuranceProviders = [
  { 
    icon: Building2,
    name: 'Aetna',
    description: 'Health Insurance',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    hoverColor: 'hover:bg-red-100'
  },
  { 
    icon: Stethoscope,
    name: 'Blue Cross',
    description: 'Blue Shield',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    hoverColor: 'hover:bg-blue-100'
  },
  { 
    icon: Heart,
    name: 'Cigna',
    description: 'Healthcare',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    hoverColor: 'hover:bg-teal-100'
  },
  { 
    icon: Activity,
    name: 'United',
    description: 'Healthcare',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    hoverColor: 'hover:bg-orange-100'
  },
  { 
    icon: Building,
    name: 'Humana',
    description: 'Insurance',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    hoverColor: 'hover:bg-green-100'
  },
  { 
    icon: User,
    name: 'Kaiser',
    description: 'Permanente',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    hoverColor: 'hover:bg-purple-100'
  }
];

const InsuranceSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Insurance Coverage</h2>
            <p className="text-gray-600">We accept all major insurance providers</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            All Insurance
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {insuranceProviders.map((provider, index) => (
            <button 
              key={index}
              className={`group p-8 rounded-2xl transition-all duration-200 ${provider.bgColor} ${provider.hoverColor} text-center md:text-left`}
            >
              <div className={`w-16 h-16 rounded-xl ${provider.bgColor} flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300`}>
                <provider.icon className={`w-8 h-8 ${provider.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
              <p className="text-gray-600">{provider.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceSection;
