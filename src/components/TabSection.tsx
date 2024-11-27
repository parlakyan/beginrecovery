import { useState } from 'react';
import { Facility } from '../types';

interface TabSectionProps {
  facility: Facility;
}

const TabSection = ({ facility }: TabSectionProps) => {
  const [activeTab, setActiveTab] = useState('about');

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="border-b">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'about' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">About {facility.name}</h3>
            <p className="text-gray-600">{facility.description}</p>
          </div>
        )}

        {activeTab === 'amenities' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {facility.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-gray-600">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reviews</h3>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-800">{facility.rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-2">/ 5.0</span>
              </div>
              <div className="ml-4">
                <span className="text-gray-500">{facility.reviewCount} reviews</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabSection;
