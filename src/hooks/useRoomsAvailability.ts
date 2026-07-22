import { useQuery } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api/hotels';
import { Room, RoomAvailability } from '@/types/hotel';

export function useRoomsAvailability(
  hotelId?: string,
  checkIn?: string,
  checkOut?: string,
  rooms?: Room[]
) {
  return useQuery<RoomAvailability[]>({
    queryKey: ['rooms-availability', hotelId, checkIn, checkOut],
    queryFn: async () => {
      if (!hotelId || !checkIn || !checkOut || !rooms?.length) return [];

      // Fetch availability for each room in parallel
      const availabilityPromises = rooms.map((room) =>
        hotelsApi
          .getRoomAvailability(hotelId, room._id, checkIn, checkOut, 1)
          .then((res) => res.data)
          .catch(() => ({
            roomId: room._id,
            totalUnits: room.totalUnits,
            bookedUnits: 0,
            availableUnits: room.totalUnits,
            requestedQuantity: 1,
            isAvailable: true,
          }))
      );

      return Promise.all(availabilityPromises);
    },
    enabled: Boolean(hotelId && checkIn && checkOut && rooms?.length),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useRoomAvailability(
  hotelId?: string,
  roomId?: string,
  checkIn?: string,
  checkOut?: string,
  quantity?: number
) {
  return useQuery<RoomAvailability>({
    queryKey: ['room-availability', hotelId, roomId, checkIn, checkOut, quantity],
    queryFn: () =>
      hotelsApi
        .getRoomAvailability(hotelId!, roomId!, checkIn!, checkOut!, quantity!)
        .then((res) => res.data),
    enabled: Boolean(hotelId && roomId && checkIn && checkOut && quantity),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}