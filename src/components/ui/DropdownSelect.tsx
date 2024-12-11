import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { optionsService } from '../../services/options';
import { treatmentTypesService } from '../../services/treatmentTypes';
import { CollectionType, TreatmentType } from '../../types';

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  label: string;
  type: CollectionType | 'treatmentTypes';
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  options?: Option[];
  useManagedOptions?: boolean;  // Flag to use managed options (like TreatmentType) instead of strings
}

export default function DropdownSelect({
  label,
  type,
  value,
  onChange,
  error,
  options: customOptions,
  useManagedOptions = false
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch options from database if no custom options provided
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (customOptions) {
          setOptions(customOptions);
          setLoading(false);
          return;
        }

        if (type === 'treatmentTypes' && useManagedOptions) {
          // Fetch managed treatment types
          const treatmentTypes = await treatmentTypesService.getTreatmentTypes();
          setOptions(treatmentTypes.map(type => ({
            value: type.id,
            label: type.name
          })));
        } else {
          // Fetch string options from optionsService
          const fetchedOptions = await optionsService.getOptions(type);
          setOptions(fetchedOptions.map(opt => ({ value: opt, label: opt })));
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [type, customOptions, useManagedOptions]);

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

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const getSelectedLabels = () => {
    return value.map(v => {
      const option = options.find(opt => opt.value === v);
      return option ? option.label : v;
    });
  };

  const clearSelection = () => {
    onChange([]);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-gray-50 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${isOpen ? 'border-blue-600' : ''} ${
          value.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white'
        }`}
      >
        <span className={value.length > 0 ? 'text-blue-700' : 'text-gray-500'}>
          {value.length > 0 ? `${label} (${value.length})` : label}
        </span>
        <ChevronDown className={`w-4 h-4 ${value.length > 0 ? 'text-blue-700' : 'text-gray-400'}`} />
      </button>

      {/* Selected Values */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {getSelectedLabels().map((label, index) => (
            <span
              key={value[index]}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
            >
              {label}
              <button
                type="button"
                onClick={() => toggleOption(value[index])}
                className="ml-2 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label key={option.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => toggleOption(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{option.label}</span>
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
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
