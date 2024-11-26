import React from 'react';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  filters: {
    treatmentTypes: string[];
    amenities: string[];
    insurance: string[];
    rating: number | null;
    priceRange: [number, number] | null;
  };
  onRemoveFilter: (type: string, value: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.treatmentTypes.length > 0 ||
    filters.amenities.length > 0 ||
    filters.insurance.length > 0 ||
    filters.rating !== null ||
    filters.priceRange !== null;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.treatmentTypes.map((type) => (
        <FilterTag
          key={type}
          label={type}
          onRemove={() => onRemoveFilter('treatmentTypes', type)}
        />
      ))}

      {filters.amenities.map((amenity) => (
        <FilterTag
          key={amenity}
          label={amenity}
          onRemove={() => onRemoveFilter('amenities', amenity)}
        />
      ))}

      {filters.insurance.map((insurance) => (
        <FilterTag
          key={insurance}
          label={insurance}
          onRemove={() => onRemoveFilter('insurance', insurance)}
        />
      ))}

      {filters.rating && (
        <FilterTag
          label={`${filters.rating}+ Stars`}
          onRemove={() => onRemoveFilter('rating', '')}
        />
      )}

      {filters.priceRange && (
        <FilterTag
          label={`$${filters.priceRange[0]} - $${filters.priceRange[1]}`}
          onRemove={() => onRemoveFilter('priceRange', '')}
        />
      )}

      <button
        onClick={onClearAll}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Clear all
      </button>
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-gray-200 rounded-full"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}