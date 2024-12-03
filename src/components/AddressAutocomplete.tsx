import React, { useEffect, useRef } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface AddressAutocompleteProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  error?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressAutocomplete({ register, setValue, error }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
      if (!window.google || !inputRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address'],
        types: ['address']
      });

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setValue('location', place.formatted_address);
        }
      });
    };

    // Load Google Places API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
      initAutocomplete();
    }

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [setValue]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Location
      </label>
      <input
        {...register('location', { required: 'Location is required' })}
        ref={(e) => {
          inputRef.current = e; // Set local ref
          register('location').ref(e); // Set react-hook-form ref
        }}
        type="text"
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Enter address..."
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
