import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { optionsService } from '../../services/options';

interface MultiSelectProps {
  label: string;
  type: 'treatment' | 'amenity' | 'insurance';
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

export default function MultiSelect({
  label,
  type,
  value,
  onChange,
  error
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch options from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        let fetchedOptions: string[] = [];
        switch (type) {
          case 'treatment':
            fetchedOptions = await optionsService.getTreatmentOptions();
            break;
          case 'amenity':
            fetchedOptions = await optionsService.getAmenityOptions();
            break;
          case 'insurance':
            fetchedOptions = await optionsService.getInsuranceOptions();
            break;
        }
        setOptions(fetchedOptions);
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [type]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const clearSelection = () => {
    onChange([]);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative" ref={dropdownRef}>
        {/* Selected Values Display */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 border rounded-lg cursor-pointer ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${isOpen ? 'ring-2 ring-blue-500' : ''}`}
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {value.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(item);
                    }}
                    className="ml-1 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">Select {label.toLowerCase()}...</span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No options found
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredOptions.map((option) => (
                    <label key={option} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value.includes(option)}
                        onChange={() => toggleOption(option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {value.length > 0 && (
              <div className="p-2 border-t">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
