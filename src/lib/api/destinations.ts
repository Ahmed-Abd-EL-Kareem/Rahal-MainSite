import { client } from './client';
import { Destination } from '@/types/destination';
import { SuccessResponse } from '@/types/api';

const serializeParams = (params?: Record<string, any>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      searchParams.set(key, String(val));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
};

export const destinationsApi = {
  getDestinations: (params?: any) =>
    client.get<SuccessResponse<Destination[]>>(`/destinations${serializeParams(params)}`),

  getNearbyDestinations: (params: { lng: number; lat: number; maxKm?: number; limit?: number }) =>
    client.get<SuccessResponse<Destination[]>>(`/destinations/nearby${serializeParams(params)}`),

  getDestinationBySlug: (slug: string) =>
    client.get<SuccessResponse<Destination>>(`/destinations/slug/${slug}`),

  getDestinationById: (id: string) =>
    client.get<SuccessResponse<Destination>>(`/destinations/${id}`),
};
