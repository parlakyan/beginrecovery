import { Facility } from '../../types';

export const facilitiesUtils = {
  transformFacilityData: (data: any): Partial<Facility> => {
    const transformedData: Partial<Facility> = {
      ...data,
      // Convert timestamps to strings
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      // Ensure arrays exist
      images: data.images || [],
      treatmentTypes: data.treatmentTypes || [],
      amenities: data.amenities || [],
      highlights: data.highlights || [],
      substances: data.substances || [],
      languages: data.languages || [],
      // Optional arrays
      conditions: data.conditions || undefined,
      therapies: data.therapies || undefined,
      insurances: data.insurances || undefined,
      licenses: data.licenses || undefined,
      // Searchable fields
      searchableLocation: data.city || data.state ? [
        data.city?.toLowerCase(),
        data.state?.toLowerCase(),
        `${data.city}, ${data.state}`.toLowerCase()
      ].filter(Boolean) : undefined,
      treatmentTypeIds: data.treatmentTypes?.length > 0 ? data.treatmentTypes.map((t: any) => t.id) : undefined,
      conditionIds: data.conditions?.length > 0 ? data.conditions.map((c: any) => c.id) : undefined,
      therapyIds: data.therapies?.length > 0 ? data.therapies.map((t: any) => t.id) : undefined,
      substanceIds: data.substances?.length > 0 ? data.substances : undefined,
      amenityIds: data.amenities?.length > 0 ? data.amenities : undefined,
      insuranceIds: data.insurances?.length > 0 ? data.insurances.map((i: any) => i.id) : undefined,
      languageIds: data.languages?.length > 0 ? data.languages : undefined,
      licenseIds: data.licenses?.length > 0 ? data.licenses.map((l: any) => l.id) : undefined
    };

    return transformedData;
  },

  validateFacilityData: (data: Partial<Facility>): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!data.name) errors.push('Name is required');
    if (!data.description) errors.push('Description is required');
    if (!data.location) errors.push('Location is required');
    if (!data.city) errors.push('City is required');
    if (!data.state) errors.push('State is required');
    if (!data.phone) errors.push('Phone is required');
    if (!data.email) errors.push('Email is required');

    // Array fields should exist
    if (!Array.isArray(data.treatmentTypes)) errors.push('Treatment types must be an array');
    if (!Array.isArray(data.amenities)) errors.push('Amenities must be an array');
    if (!Array.isArray(data.highlights)) errors.push('Highlights must be an array');
    if (!Array.isArray(data.substances)) errors.push('Substances must be an array');
    if (!Array.isArray(data.languages)) errors.push('Languages must be an array');

    // Coordinates validation
    if (!data.coordinates || typeof data.coordinates.lat !== 'number' || typeof data.coordinates.lng !== 'number') {
      errors.push('Valid coordinates are required');
    }

    return errors;
  }
};
