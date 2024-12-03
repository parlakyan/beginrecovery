import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SearchFiltersState } from '../types';

interface FilterBarProps {
  filters: SearchFiltersState;
  filterOptions: {
    locations: Set<string>;
    treatmentTypes: Set<string>;
    amenities: Set<string>;
  };
  onFilterChange: (type: keyof SearchFiltersState, value: string) => void;
}

export default function FilterBar({ filters, filterOptions, onFilterChange }: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  const handleDropdownClick = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-max p-2">
        {/* Location Filter */}
        <div className="relative">
          <button
            onClick={() => handleDropdownClick('location')}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 hover:bg-gray-50 ${
              activeDropdown === 'location' ? 'border-blue-600' : 'border-gray-200'
            }`}
          >
            <span>Location</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {activeDropdown === 'location' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from(filterOptions.locations).map(location => (
                  <label key={location} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.treatmentTypes.includes(location)}
                      onChange={() => onFilterChange('treatmentTypes', location)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Treatment Types Filter */}
        <div className="relative">
          <button
            onClick={() => handleDropdownClick('treatment')}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 hover:bg-gray-50 ${
              activeDropdown === 'treatment' ? 'border-blue-600' : 'border-gray-200'
            }`}
          >
            <span>Treatment Types</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {activeDropdown === 'treatment' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from(filterOptions.treatmentTypes).map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.treatmentTypes.includes(type)}
                      onChange={() => onFilterChange('treatmentTypes', type)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Amenities Filter */}
        <div className="relative">
          <button
            onClick={() => handleDropdownClick('amenities')}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 hover:bg-gray-50 ${
              activeDropdown === 'amenities' ? 'border-blue-600' : 'border-gray-200'
            }`}
          >
            <span>Amenities</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {activeDropdown === 'amenities' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from(filterOptions.amenities).map(amenity => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => onFilterChange('amenities', amenity)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="relative">
          <button
            onClick={() => handleDropdownClick('rating')}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 hover:bg-gray-50 ${
              activeDropdown === 'rating' ? 'border-blue-600' : 'border-gray-200'
            }`}
          >
            <span>Rating</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {activeDropdown === 'rating' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => {
                      onFilterChange('rating', rating.toString());
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filters.rating === rating
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {rating}+ Stars
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
