import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { SearchFiltersState } from '../types';
import { substancesService } from '../services/substances';

interface FilterBarProps {
  filters: SearchFiltersState;
  filterOptions: {
    locations: Set<string>;
    treatmentTypes: Set<string>;
    amenities: Set<string>;
    conditions: Set<string>;
    substances: Set<string>;
    therapies: Set<string>;
  };
  optionCounts: {
    locations: { [key: string]: number };
    treatmentTypes: { [key: string]: number };
    amenities: { [key: string]: number };
    conditions: { [key: string]: number };
    substances: { [key: string]: number };
    therapies: { [key: string]: number };
  };
  onFilterChange: (type: keyof SearchFiltersState, value: string, clearOthers?: boolean) => void;
}

export default function FilterBar({ filters, filterOptions, optionCounts, onFilterChange }: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState({
    location: '',
    treatmentTypes: '',
    amenities: '',
    conditions: '',
    substances: '',
    therapies: '',
    rating: ''
  });
  const [substanceOptions, setSubstanceOptions] = useState<{ id: string; name: string }[]>([]);

  // Fetch substance options
  useEffect(() => {
    const fetchSubstances = async () => {
      try {
        const substances = await substancesService.getSubstances();
        setSubstanceOptions(substances);
      } catch (error) {
        console.error('Error fetching substances:', error);
      }
    };
    fetchSubstances();
  }, []);

  const handleDropdownClick = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSearchChange = (dropdown: string, query: string) => {
    setSearchQueries(prev => ({ ...prev, [dropdown]: query }));
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.filter-dropdown')) {
      setActiveDropdown(null);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSelection = (type: keyof SearchFiltersState) => {
    // Clear the search query
    handleSearchChange(type, '');
    // Clear all selected items of this type
    const current = filters[type] as string[];
    current.forEach(value => {
      onFilterChange(type, value);
    });
    setActiveDropdown(null);
  };

  const renderDropdown = (
    type: 'location' | 'treatmentTypes' | 'amenities' | 'conditions' | 'substances' | 'therapies',
    title: string,
    options: Set<string>,
    counts: { [key: string]: number }
  ) => {
    let sortedOptions;
    if (type === 'substances') {
      // For substances, use the managed options
      sortedOptions = substanceOptions
        .map(substance => ({
          value: substance.id,
          label: substance.name,
          count: counts[substance.id] || 0
        }))
        .sort((a, b) => b.count - a.count);
    } else {
      // For other types, use the original options
      sortedOptions = Array.from(options)
        .map(option => ({ 
          value: option,
          label: option,
          count: counts[option] || 0 
        }))
        .sort((a, b) => b.count - a.count);
    }

    const filteredOptions = sortedOptions.filter(option =>
      option.label.toLowerCase().includes(searchQueries[type].toLowerCase())
    );

    // Use the actual type for filtering
    const filterType = type;

    return (
      <div className="relative filter-dropdown">
        <button
          onClick={() => handleDropdownClick(type)}
          className={`px-4 py-2 rounded-full border flex items-center gap-2 hover:bg-gray-50 ${
            activeDropdown === type ? 'border-blue-600' : 'border-gray-200'
          }`}
        >
          <span>{title}</span>
          {(filters[filterType] as string[]).length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {(filters[filterType] as string[]).length}
            </span>
          )}
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
              {filteredOptions.map(({ value, label, count }) => (
                <label key={value} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters[filterType].includes(value)}
                      onChange={() => onFilterChange(filterType, value)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <span className="text-xs text-gray-500">({count})</span>
                </label>
              ))}
            </div>

            {/* Clear button */}
            {(filters[filterType] as string[]).length > 0 && (
              <button
                onClick={() => handleClearSelection(filterType)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 py-3 flex-wrap">
        {renderDropdown('location', 'Location', filterOptions.locations, optionCounts.locations)}
        {renderDropdown('treatmentTypes', 'Treatment Types', filterOptions.treatmentTypes, optionCounts.treatmentTypes)}
        {renderDropdown('conditions', 'Conditions', filterOptions.conditions, optionCounts.conditions)}
        {renderDropdown('substances', 'Substances', filterOptions.substances, optionCounts.substances)}
        {renderDropdown('therapies', 'Therapies', filterOptions.therapies, optionCounts.therapies)}
        {renderDropdown('amenities', 'Amenities', filterOptions.amenities, optionCounts.amenities)}

        {/* Rating Filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() => handleDropdownClick('rating')}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 hover:bg-gray-50 ${
              activeDropdown === 'rating' ? 'border-blue-600' : 'border-gray-200'
            }`}
          >
            <span>Rating</span>
            {filters.rating !== null && (
              <X 
                className="w-4 h-4 text-gray-400 hover:text-gray-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange('rating', '0');
                  setActiveDropdown(null);
                }}
              />
            )}
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
                <button
                  onClick={() => {
                    onFilterChange('rating', '0');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Any Rating
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
