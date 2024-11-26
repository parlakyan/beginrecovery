import React from 'react';

const popularLocations = [
  { 
    name: 'Los Angeles',
    state: 'CA',
    count: 245,
    image: 'https://images.unsplash.com/photo-1515896769750-31548aa180ed?auto=format&fit=crop&q=80&w=1200&h=800'
  },
  { 
    name: 'New York City',
    state: 'NY', 
    count: 189,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200&h=800'
  },
  { 
    name: 'Miami',
    state: 'FL',
    count: 156,
    image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&q=80&w=1200&h=800'
  },
  { 
    name: 'Houston',
    state: 'TX',
    count: 134,
    image: 'https://images.unsplash.com/photo-1548519853-8393f0a12c03?auto=format&fit=crop&q=80&w=1200&h=800'
  },
  { 
    name: 'Chicago',
    state: 'IL',
    count: 123,
    image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1200&h=800'
  },
  { 
    name: 'Phoenix',
    state: 'AZ',
    count: 98,
    image: 'https://images.unsplash.com/photo-1558302225-a4f8871105c5?auto=format&fit=crop&q=80&w=1200&h=800'
  }
];

export default function LocationBrowser() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse by Location</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find treatment centers in major cities across the United States
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {popularLocations.map((location, index) => (
            <button 
              key={index}
              className="group relative block w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-xl aspect-[3/2]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/90" />
                <img 
                  src={location.image} 
                  alt={location.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-white text-center">
                  <h3 className="font-semibold text-3xl mb-2">{location.name}</h3>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl opacity-90">{location.state}</span>
                    <span className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      {location.count} centers
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}