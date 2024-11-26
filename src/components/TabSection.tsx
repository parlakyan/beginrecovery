import React from 'react';
import { 
  Info, 
  Heart, 
  Home, 
  MessageCircle,
  HelpCircle,
  Shield
} from 'lucide-react';

const tabs = [
  { id: 'about', label: 'About', icon: Info },
  { id: 'treatment', label: 'Treatment', icon: Heart },
  { id: 'amenities', label: 'Amenities', icon: Home },
  { id: 'reviews', label: 'Reviews', icon: MessageCircle },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'insurance', label: 'Insurance', icon: Shield }
];

interface TabSectionProps {
  facility: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabSection({ facility, activeTab, setActiveTab }: TabSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'about' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">About {facility.name}</h2>
            <p className="text-gray-600">
              {facility.description}
            </p>
            {/* Add more about content */}
          </div>
        )}
        
        {activeTab === 'treatment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Treatment Programs</h2>
            {/* Add treatment content */}
          </div>
        )}

        {/* Add other tab contents */}
      </div>
    </div>
  );
}