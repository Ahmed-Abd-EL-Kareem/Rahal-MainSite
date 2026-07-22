'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Minus, Plus, Trash2, Hotel, Users, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Room, RoomAvailability } from '@/types/hotel';
import { RoomSelection } from '@/types/booking';
import Button from '@/components/ui/Button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { slideUpFromBottom, staggerContainer, slideUpFade } from '@/lib/animations/variants';

interface RoomSelectionSummaryProps {
  selections: Record<string, RoomSelection>;
  rooms: Room[];
  availabilities: RoomAvailability[];
  checkIn: string;
  checkOut: string;
  nights: number;
  currency: string;
  onUpdateQuantity: (roomId: string, quantity: number) => void;
  onUpdateGuests: (roomId: string, guests: { adults: number; children: number }) => void;
  onRemove: (roomId: string) => void;
  onBook: () => void;
  isBooking: boolean;
  className?: string;
}

function SelectionItem({
  room,
  selection,
  availability,
  nights,
  currency,
  onUpdateQuantity,
  onUpdateGuests,
  onRemove,
}: {
  room: Room;
  selection: RoomSelection;
  availability?: RoomAvailability;
  nights: number;
  currency: string;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateGuests: (guests: { adults: number; children: number }) => void;
  onRemove: () => void;
}) {
  const t = useTranslations('hotels.room');
  const locale = useLocale();
  const availableUnits = availability?.availableUnits ?? room.totalUnits;
  const maxQuantity = Math.min(availableUnits, 5);
  const subtotal = room.pricePerNight * nights * selection.quantity;
  const reduceMotion = useReducedMotion();

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.min(Math.max(1, selection.quantity + delta), maxQuantity);
    onUpdateQuantity(newQty);
  };

  const handleAdultsChange = (delta: number) => {
    const maxAdults = room.maxAdults * selection.quantity;
    const newAdults = Math.min(Math.max(1, selection.guests.adults + delta), maxAdults);
    onUpdateGuests({ adults: newAdults, children: selection.guests.children });
  };

  const handleChildrenChange = (delta: number) => {
    const maxChildren = room.maxChildren * selection.quantity;
    const newChildren = Math.min(Math.max(0, selection.guests.children + delta), maxChildren);
    onUpdateGuests({ adults: selection.guests.adults, children: newChildren });
  };

  const maxAdults = room.maxAdults * selection.quantity;
  const maxChildren = room.maxChildren * selection.quantity;

  return (
    <motion.div
      className="bg-surface-container/50 rounded-xl p-4 border border-primary/10 shadow-sm"
      initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-on-surface text-sm tracking-[-0.01em]">{room.name[locale as 'en' | 'ar'] || room.name.en}</p>
          <p className="text-xs text-on-surface-variant capitalize">{room.roomType}</p>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          aria-label={t('removeRoom')}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-on-surface-variant w-20 shrink-0">{t('quantity')}</span>
          <div className="flex items-center gap-2 border border-primary/30 rounded-full overflow-hidden bg-surface-container-lowest">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={selection.quantity <= 1}
              className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center font-bold text-on-surface text-sm tabular-nums">{selection.quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={selection.quantity >= maxQuantity}
              className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={14} />
            </button>
            <span className="text-[10px] text-on-surface-variant px-2">/ {maxQuantity}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">{t('adults')}</span>
            <div className="flex items-center gap-1.5 p-2 bg-surface-container rounded-lg border border-primary/10">
              <button
                onClick={() => handleAdultsChange(-1)}
                disabled={selection.guests.adults <= 1}
                className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center font-bold text-on-surface text-sm tabular-nums">{selection.guests.adults}</span>
              <button
                onClick={() => handleAdultsChange(1)}
                disabled={selection.guests.adults >= maxAdults}
                className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              >
                <Plus size={12} />
              </button>
              <span className="text-[10px] text-on-surface-variant ml-1">/ {maxAdults}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">{t('children')}</span>
            <div className="flex items-center gap-1.5 p-2 bg-surface-container rounded-lg border border-primary/10">
              <button
                onClick={() => handleChildrenChange(-1)}
                disabled={selection.guests.children <= 0}
                className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center font-bold text-on-surface text-sm tabular-nums">{selection.guests.children}</span>
              <button
                onClick={() => handleChildrenChange(1)}
                disabled={selection.guests.children >= maxChildren}
                className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              >
                <Plus size={12} />
              </button>
              <span className="text-[10px] text-on-surface-variant ml-1">/ {maxChildren}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-primary/10 flex justify-between items-center">
          <span className="font-medium text-on-surface-variant text-sm">{t('subtotal')}</span>
          <span className="font-display font-bold text-on-surface text-lg tabular-nums">
            {subtotal.toLocaleString()} {currency}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function RoomSelectionSummary({
  selections,
  rooms,
  availabilities,
  checkIn,
  checkOut,
  nights,
  currency,
  onUpdateQuantity,
  onUpdateGuests,
  onRemove,
  onBook,
  isBooking,
  className,
}: RoomSelectionSummaryProps) {
  const t = useTranslations('hotels.room');
  const reduceMotion = useReducedMotion();

  const selectedRooms = Object.entries(selections).map(([roomId, selection]) => {
    const room = rooms.find((r) => r._id === roomId);
    const availability = availabilities.find((a) => a.roomId === roomId);
    return { room, selection, availability };
  }).filter((item): item is { room: Room; selection: RoomSelection; availability: RoomAvailability | undefined } =>
    Boolean(item.room)
  );

  const totalRooms = selectedRooms.reduce((sum, item) => sum + item.selection.quantity, 0);
  const totalGuests = selectedRooms.reduce(
    (sum, item) => sum + item.selection.guests.adults + item.selection.guests.children,
    0
  );
  const grandTotal = selectedRooms.reduce(
    (sum, item) => sum + item.room.pricePerNight * nights * item.selection.quantity,
    0
  );

  const isEmpty = selectedRooms.length === 0;

  return (
    <motion.div
      className={cn(
        'bg-surface border border-primary/20 rounded-2xl p-4 md:p-6 shadow-card-hover sticky top-24 z-20 space-y-6',
        className
      )}
      initial={reduceMotion ? {} : { opacity: 0, x: -20 }}
      animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg md:text-xl text-on-surface">{t('selectionSummary')}</h3>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {totalRooms} {t('roomsSelected')}
        </span>
      </div>

      {isEmpty ? (
        <motion.div
          className="text-center py-8 text-on-surface-variant"
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Hotel className="mx-auto text-4xl mb-3 opacity-50" size={48} />
          <p className="font-medium">{t('noRoomsSelected')}</p>
          <p className="text-sm mt-1">{t('selectRoomsToBook')}</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="space-y-3 max-h-[400px] overflow-y-auto pr-1"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            custom={selectedRooms.length}
          >
            {selectedRooms.map(({ room, selection, availability }) => (
              <SelectionItem
                key={room._id}
                room={room}
                selection={selection}
                availability={availability}
                nights={nights}
                currency={currency}
                onUpdateQuantity={(qty) => onUpdateQuantity(room._id, qty)}
                onUpdateGuests={(guests) => onUpdateGuests(room._id, guests)}
                onRemove={() => onRemove(room._id)}
              />
            ))}
          </motion.div>

          <motion.div
            className="space-y-3 pt-3 border-t border-primary/10"
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>{t('nights')}</span>
              <span className="font-bold tabular-nums">{nights}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>{t('totalRooms')}</span>
              <span className="font-bold tabular-nums">{totalRooms}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>{t('totalGuests')}</span>
              <span className="font-bold tabular-nums">{totalGuests}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-primary/10">
              <span className="font-display font-bold text-on-surface">{t('grandTotal')}</span>
              <span className="font-display font-bold text-primary text-xl tabular-nums">
                {grandTotal.toLocaleString()} {currency}
              </span>
            </div>
          </motion.div>

          <motion.button
            onClick={onBook}
            disabled={isBooking || isEmpty}
            className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md active:scale-95 transition-transform bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {isBooking ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <span>{t('bookingInProgress')}</span>
              </span>
            ) : (
              <>
                <span>{t('bookNow')}</span>
                <ChevronRight size={16} />
              </>
            )}
          </motion.button>

          <p className="text-center text-[10px] text-on-surface-variant font-medium">
            {t('disclaimer')}
          </p>
        </>
      )}
    </motion.div>
  );
}