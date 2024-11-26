import React from 'react';
import { MapPin } from 'lucide-react';

interface MapSectionProps {
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function MapSection({ coordinates }: MapSectionProps) {
  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <MapPin className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Location</h2>
      </div>

      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${coordinates.lat},${coordinates.lng}`}
          allowFullScreen
        />
      </div>
    </section>
  );
}