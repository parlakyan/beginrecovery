import React, { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { SearchFiltersState } from '../types';

interface FilterOption {
  value: string;
  count: number;
}

interface FilterBarProps {
  filters: SearchFiltersState;
  filterOptions: {
    locations: Set<string>;
    treatmentTypes: Set<string>;
    amenities: Set<string>;
  };
  optionCounts: {
    locations: { [key: string]: number };
    treatmentTypes: { [key: string]: number };
    amenities: { [key: string]: number };
  };
  onFilterChange: (type: keyof SearchFiltersState, value: string) => void;
}

type FilterType = 'location' | 'treatmentTypes' | 'amenities';

export default function FilterBar({ filters, filterOptions, optionCounts, onFilterChange }: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState({
    location: '',
    treatmentTypes: '',
    amenities: '',
    rating: ''
  });

  const handleDropdownClick = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSearchChange = (dropdown: string, query: string) => {
    setSearchQueries(prev => ({ ...prev, [dropdown]: query }));
  };

  const sortByCount = (options: string[], counts: { [key: string]: number }): FilterOption[] => {
    return Array.from(options)
      .map(option => ({ value: option, count: counts[option] || 0 }))
      .sort((a, b) => b.count - a.count);
  };

  const filterOptionsBySearch = (options: FilterOption[], search: string) => {
    const searchLower = search.toLowerCase();
    return options.filter(option => 
      option.value.toLowerCase().includes(searchLower)
    );
  };

  const renderDropdown = (
    type: FilterType,
    title: string,
    options: Set<string>,
    counts: { [key: string]: number }
  ) => {
    const sortedOptions = sortByCount(Array.from(options), counts);
    const filteredOptions = filterOptionsBySearch(sortedOptions, searchQueries[type]);
    const filterType: keyof SearchFiltersState = type === 'location' ? 'treatmentTypes' : type;

    return (
      <div className="relative">
        <button
          onClick={() => handleDropdownClick(type)}
          className={`px-4 py-2 rounded-full border flex items-center gap-2 hover:bg-gray-50 ${
            activeDropdown === type ? 'border-blue-600' : 'border-gray-200'
          }`}
        >
          <span>{title}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {activeDropdown === type && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            {/* Search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQueries[type]}
                onChange={(e) => handleSearchChange(type, e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Options list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredOptions.map(({ value, count }) => (
                <label key={value} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters[filterType].includes(value)}
                      onChange={() => onFilterChange(filterType, value)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{value}</span>
                  </div>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              ))}
            </div>

            {/* Clear button */}
            <button
              onClick={() => {
                handleSearchChange(type, '');
                setActiveDropdown(null);
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-max p-2">
        {renderDropdown('location', 'Location', filterOptions.locations, optionCounts.locations)}
        {renderDropdown('treatmentTypes', 'Treatment Types', filterOptions.treatmentTypes, optionCounts.treatmentTypes)}
        {renderDropdown('amenities', 'Amenities', filterOptions.amenities, optionCounts.amenities)}

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
