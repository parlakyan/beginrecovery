import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { treatmentTypesService } from '../services/treatmentTypes';
import { amenitiesService } from '../services/amenities';
import { insurancesService } from '../services/insurances';
import { conditionsService } from '../services/conditions';
import { substancesService } from '../services/substances';
import { therapiesService } from '../services/therapies';
import { languagesService } from '../services/languages';
import { TreatmentType, Amenity, Insurance, Condition, Substance, Therapy, Language } from '../types';

interface Filters {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  conditions: string[];
  substances: string[];
  therapies: string[];
  languages: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

type FilterKey = keyof Omit<Filters, 'rating' | 'priceRange'>;

interface ManagedOption {
  id: string;
  name: string;
}

export default function SearchFilters({ isOpen, onClose, filters, onFilterChange }: SearchFiltersProps) {
  const [managedOptions, setManagedOptions] = useState<{
    treatmentTypes: TreatmentType[];
    amenities: Amenity[];
    insurances: Insurance[];
    conditions: Condition[];
    substances: Substance[];
    therapies: Therapy[];
    languages: Language[];
  }>({
    treatmentTypes: [],
    amenities: [],
    insurances: [],
    conditions: [],
    substances: [],
    therapies: [],
    languages: []
  });

  // Fetch all managed options
  useEffect(() => {
    const fetchManagedOptions = async () => {
      try {
        const [
          treatmentTypes,
          amenities,
          insurances,
          conditions,
          substances,
          therapies,
          languages
        ] = await Promise.all([
          treatmentTypesService.getTreatmentTypes(),
          amenitiesService.getAmenities(),
          insurancesService.getInsurances(),
          conditionsService.getConditions(),
          substancesService.getSubstances(),
          therapiesService.getTherapies(),
          languagesService.getLanguages()
        ]);

        setManagedOptions({
          treatmentTypes,
          amenities,
          insurances,
          conditions,
          substances,
          therapies,
          languages
        });
      } catch (error) {
        console.error('Error fetching managed options:', error);
      }
    };
    fetchManagedOptions();
  }, []);

  if (!isOpen) return null;

  const renderFilterSection = (
    title: string,
    options: ManagedOption[],
    filterKey: FilterKey
  ) => (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.id} className="flex items-center">
            <input
              type="checkbox"
              checked={filters[filterKey].includes(option.id)}
              onChange={(e) => {
                const newValues = e.target.checked
                  ? [...filters[filterKey], option.id]
                  : filters[filterKey].filter((id) => id !== option.id);
                onFilterChange({ ...filters, [filterKey]: newValues });
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">{option.name}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Treatment Types */}
          {renderFilterSection('Treatment Types', managedOptions.treatmentTypes, 'treatmentTypes')}

          {/* Conditions */}
          {renderFilterSection('Conditions', managedOptions.conditions, 'conditions')}

          {/* Substances */}
          {renderFilterSection('Substances', managedOptions.substances, 'substances')}

          {/* Therapies */}
          {renderFilterSection('Therapies', managedOptions.therapies, 'therapies')}

          {/* Languages */}
          {renderFilterSection('Languages', managedOptions.languages, 'languages')}

          {/* Amenities */}
          {renderFilterSection('Amenities', managedOptions.amenities, 'amenities')}

          {/* Insurance */}
          {renderFilterSection('Insurance Accepted', managedOptions.insurances, 'insurance')}

          {/* Rating */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Minimum Rating</h3>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.rating || 0}
              onChange={(e) => {
                onFilterChange({
                  ...filters,
                  rating: parseFloat(e.target.value) || null,
                });
              }}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Any</span>
              <span>{filters.rating || 0} Stars</span>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Price Range (per month)</h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange?.[0] || ''}
                onChange={(e) => {
                  const min = parseInt(e.target.value);
                  onFilterChange({
                    ...filters,
                    priceRange: [min, filters.priceRange?.[1] || 50000],
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange?.[1] || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value);
                  onFilterChange({
                    ...filters,
                    priceRange: [filters.priceRange?.[0] || 0, max],
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
