import { Shield } from 'lucide-react';

export default function InsuranceSection() {
  const insuranceProviders = [
    'Aetna',
    'Blue Cross Blue Shield',
    'Cigna',
    'UnitedHealthcare',
    'Humana',
    'Kaiser Permanente',
    'Anthem',
    'Medicare',
    'Medicaid'
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Insurance Coverage</h2>
          <p className="text-xl text-gray-600">
            We work with most major insurance providers to ensure you get the care you need. Contact us to verify your coverage.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {insuranceProviders.map((provider, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
              >
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">{provider}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Don't see your insurance provider? Contact us to discuss your coverage options.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
