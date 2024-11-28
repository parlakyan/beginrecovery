import { MapPin } from 'lucide-react';

export default function LocationBrowser() {
  const locations = [
    'Los Angeles, CA',
    'New York, NY',
    'Chicago, IL',
    'Houston, TX',
    'Miami, FL',
    'San Francisco, CA',
    'Seattle, WA',
    'Denver, CO',
    'Phoenix, AZ',
    'Atlanta, GA',
    'Boston, MA',
    'Las Vegas, NV'
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Browse by Location</h2>
          <p className="text-xl text-gray-600">
            Find treatment centers in your area or explore options in different locations.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {locations.map((location, index) => (
              <button 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:bg-blue-50 flex items-center gap-3 group"
              >
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">{location}</span>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              <span>View All Locations</span>
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
