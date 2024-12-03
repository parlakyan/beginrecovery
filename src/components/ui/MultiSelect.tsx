import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { CollectionType } from '../../types';
import { optionsService } from '../../services/options';

interface MultiSelectProps {
  label: string;
  type: CollectionType;
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
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch options from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const fetchedOptions = await optionsService.getOptions(type);
        setOptions(fetchedOptions);
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [type]);

  // Filter options when input changes
  useEffect(() => {
    setFilteredOptions(
      optionsService.filterOptions(
        options.filter(option => !value.includes(option)),
        input
      )
    );
  }, [input, options, value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        // Add first suggestion
        onChange([...value, filteredOptions[0]]);
      } else if (!value.includes(input.trim())) {
        // Add custom input if it doesn't exist
        onChange([...value, input.trim()]);
      }
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange([...value, suggestion]);
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(value.filter(item => item !== itemToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Selected Items */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="ml-2 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Loading options...' : `Type to add ${label.toLowerCase()}...`}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredOptions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSuggestionClick(option)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
