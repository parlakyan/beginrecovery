import React, { useEffect, useRef, useState } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface AddressAutocompleteProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  error?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback?: () => void;
  }
}

export default function AddressAutocomplete({ register, setValue, error }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      setScriptError('Google Maps API key is not configured');
      setIsLoading(false);
      return;
    }

    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
      if (!window.google || !inputRef.current) {
        setScriptError('Failed to initialize Google Maps');
        setIsLoading(false);
        return;
      }

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'geometry', 'address_components'],
          types: ['address']
        });

        // Handle place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (!place) {
            console.warn('Place data not available');
            return;
          }

          // Set location (address)
          if (place.formatted_address) {
            setValue('location', place.formatted_address);
          }
          
          // Set coordinates if available
          if (place.geometry?.location) {
            setValue('coordinates', {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            });
          }

          // Extract and set address components if available
          if (place.address_components && Array.isArray(place.address_components)) {
            try {
              const addressComponents: { [key: string]: string } = {};
              place.address_components.forEach((component: any) => {
                if (component && component.types && Array.isArray(component.types)) {
                  const type = component.types[0];
                  if (type) {
                    addressComponents[type] = component.long_name;
                    if (type === 'administrative_area_level_1') {
                      addressComponents.state_short = component.short_name;
                    }
                  }
                }
              });

              // Set individual address fields
              if (addressComponents.street_number && addressComponents.route) {
                setValue('street', `${addressComponents.street_number} ${addressComponents.route}`);
              }
              if (addressComponents.locality) {
                setValue('city', addressComponents.locality);
              }
              if (addressComponents.administrative_area_level_1) {
                setValue('state', addressComponents.state_short);
              }
              if (addressComponents.postal_code) {
                setValue('zipCode', addressComponents.postal_code);
              }

              // Log the extracted components for debugging
              console.log('Extracted address components:', {
                street: addressComponents.street_number && addressComponents.route ? 
                  `${addressComponents.street_number} ${addressComponents.route}` : undefined,
                city: addressComponents.locality,
                state: addressComponents.state_short,
                zipCode: addressComponents.postal_code
              });
            } catch (err) {
              console.warn('Error processing address components:', err);
            }
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Autocomplete initialization error:', err);
        setScriptError('Failed to initialize address autocomplete');
        setIsLoading(false);
      }
    };

    // Load Google Places API if not already loaded
    if (!window.google) {
      try {
        // Create a unique callback name
        const callbackName = 'initGoogleMapsCallback';
        window[callbackName] = initAutocomplete;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          setScriptError('Failed to load Google Maps script');
          setIsLoading(false);
        };
        document.head.appendChild(script);

        return () => {
          // Cleanup
          delete window[callbackName];
          script.remove();
        };
      } catch (err) {
        console.error('Script loading error:', err);
        setScriptError('Failed to load Google Maps script');
        setIsLoading(false);
      }
    } else {
      initAutocomplete();
    }

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [setValue]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Location
      </label>
      <div className="relative">
        <input
          {...register('location', { required: 'Location is required' })}
          ref={(e) => {
            inputRef.current = e; // Set local ref
            register('location').ref(e); // Set react-hook-form ref
          }}
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            error || scriptError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter address..."
          disabled={isLoading}
          aria-invalid={!!error || !!scriptError}
          aria-describedby={error || scriptError ? 'address-error' : undefined}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>
      {(error || scriptError) && (
        <p id="address-error" className="mt-1 text-sm text-red-600" role="alert">
          {error || scriptError}
        </p>
      )}
    </div>
  );
}
