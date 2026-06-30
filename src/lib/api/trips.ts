// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { client } from './client';
// import { Trip } from '@/types/trip';
// import { SuccessResponse } from '@/types/api';

// const serializeParams = (params?: Record<string, any>) => {
//   if (!params) return '';
//   const searchParams = new URLSearchParams();
//   Object.entries(params).forEach(([key, val]) => {
//     if (val !== undefined && val !== null) {
//       searchParams.set(key, String(val));
//     }
//   });
//   const str = searchParams.toString();
//   return str ? `?${str}` : '';
// };

// export const tripsApi = {
//   generateTrip: (body: {
//     destination: string;
//     duration: number;
//     budget?: 'budget' | 'mid-range' | 'luxury' | string;
//     travelers?: number;
//     interests?: string[];
//     language?: 'en' | 'ar';
//     imageUrl?: string;
//   }) =>
//     client.post<SuccessResponse<{ trip: Trip }>>('/trips/generate', body),

//   createTrip: (body: any) =>
//     client.post<SuccessResponse<{ trip: Trip }>>('/trips', body),

//   getTrips: (params?: any) =>
//     client.get<SuccessResponse<Trip[]>>(`/trips${serializeParams(params)}`),

//   getTripById: (id: string) =>
//     client.get<SuccessResponse<Trip>>(`/trips/${id}`),

//   updateTrip: (id: string, body: any) =>
//     client.patch<SuccessResponse<Trip>>(`/trips/${id}`, body),
// };
import { client } from './client';
import { Trip } from '@/types/trip';
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

export const tripsApi = {
  generateTrip: (body: {
    destination: string;
    duration: number;
    budget?: 'budget' | 'mid-range' | 'luxury' | string;
    travelers?: number;
    interests?: string[];
    language?: 'en' | 'ar';
    imageUrl?: string;
  }) =>
    client.post<SuccessResponse<{ trip: Trip }>>('/trips/generate', body),

  createTrip: (body: any) =>
    client.post<SuccessResponse<{ trip: Trip }>>('/trips', body),

  getTrips: (params?: any) =>
    client.get<SuccessResponse<Trip[]>>(`/trips${serializeParams(params)}`),

  getTripById: (id: string) =>
    client.get<SuccessResponse<Trip>>(`/trips/${id}`),

  updateTrip: (id: string, body: any) =>
    client.patch<SuccessResponse<Trip>>(`/trips/${id}`, body),
  deleteTrip: (id: string) =>
  client.delete<SuccessResponse<null>>(`/trips/${id}`),
};
