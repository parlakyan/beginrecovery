import api from './api';
import { Facility } from '../types';

interface FacilityResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  rating: number;
  images: string[];
  amenities: string[];
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  staff: Array<{
    name: string;
    role: string;
    image: string;
    credentials: string;
    description: string;
  }>;
  insurance: Array<{
    provider: string;
    logo: string;
    coverage: string[];
  }>;
}

export const facilitiesApi = {
  getAll: () => 
    api.get<FacilityResponse[]>('/facilities'),
  
  getById: (id: string) => 
    api.get<FacilityResponse>(`/facilities/${id}`),
  
  search: (params: { 
    query?: string;
    location?: string;
    tags?: string[];
    insurance?: string[];
    rating?: number;
  }) => api.get<FacilityResponse[]>('/facilities/search', { params }),
  
  create: (data: Partial<FacilityResponse>) => 
    api.post<{ id: string }>('/facilities', data),
  
  update: (id: string, data: Partial<FacilityResponse>) => 
    api.put(`/facilities/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/facilities/${id}`)
};