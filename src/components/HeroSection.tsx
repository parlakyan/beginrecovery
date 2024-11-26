import React from 'react';
import { Search, Shield, MapPin, Clock } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative min-h-[80vh] flex items-center">
      {/* Background with overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536152470836-b943b246224c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-purple-900/95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
            Your Journey to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Recovery
            </span>{' '}
            Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 animate-fade-in-delay">
            Find trusted rehabilitation centers that match your needs and accept your insurance
          </p>

          <div className="relative max-w-2xl animate-fade-in-delay-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by location or treatment type..."
              className="w-full pl-12 pr-32 py-4 rounded-xl bg-white shadow-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200">
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-8 mt-12 animate-fade-in-delay-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Verified Centers</div>
                <div className="text-blue-200 text-sm">Licensed & Accredited</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-semibold">500+ Locations</div>
                <div className="text-blue-200 text-sm">Nationwide Coverage</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-white font-semibold">24/7 Support</div>
                <div className="text-blue-200 text-sm">Always Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}