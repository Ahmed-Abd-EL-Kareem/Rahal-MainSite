'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Minus, Plus, Users, UserPlus, UserMinus, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Room, RoomAvailability } from '@/types/hotel';
import { RoomSelection } from '@/types/booking';
import Badge from '@/components/ui/Badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { slideUpFade, staggerContainer } from '@/lib/animations/variants';

interface RoomCardProps {
  room: Room;
  availability?: RoomAvailability;
  selection: RoomSelection | null;
  onChange: (selection: RoomSelection | null) => void;
  className?: string;
  index?: number;
}

function QuantityStepper({
  value,
  min,
  max,
  onChange,
  disabled = false,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-2 border border-primary/30 rounded-full overflow-hidden bg-surface-container-lowest">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="w-10 text-center font-bold text-on-surface text-sm tabular-nums">{value}</span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function GuestInput({
  label,
  value,
  max,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const t = useTranslations('hotels.room');

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-2 p-2.5 bg-surface-container rounded-lg border border-outline-variant/20">
        <Users size={14} className="text-secondary shrink-0" />
        <input
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.min(Math.max(0, Number(e.target.value)), max))}
          className="bg-transparent border-none p-0 focus:ring-0 text-on-surface w-full text-sm font-bold text-center tabular-nums"
          disabled={disabled}
        />
        <span className="text-[10px] text-on-surface-variant font-medium">/ {max}</span>
      </div>
      {value > max && (
        <p className="text-[10px] text-error font-medium flex items-center gap-1">
          <AlertCircle size={10} />
          {t('guestExceedsCapacity')}
        </p>
      )}
    </div>
  );
}

const RoomCardContainer = motion.div;

export function RoomCard({ room, availability, selection, onChange, className, index = 0 }: RoomCardProps) {
  const t = useTranslations('hotels.room');
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  const availableUnits = availability?.availableUnits ?? room.totalUnits;
  const bookedUnits = availability?.bookedUnits ?? 0;
  const totalUnits = room.totalUnits;
  const isSoldOut = availableUnits <= 0;
  const isLowAvailability = availableUnits > 0 && availableUnits <= 2;
  const maxQuantity = Math.min(availableUnits, 5);

  const roomName = room.name?.[locale as 'en' | 'ar'] || room.name?.en || `Room ${room._id?.slice(-6) || 'Unknown'}`;

  const handleQuantityChange = (quantity: number) => {
    if (quantity <= 0) {
      onChange(null);
      return;
    }
    const clamped = Math.min(quantity, maxQuantity);
    onChange({
      room: room._id,
      quantity: clamped,
      guests: selection?.guests ?? { adults: 1, children: 0 },
    });
  };

  const handleGuestsChange = (guests: { adults: number; children: number }) => {
    if (!selection) return;
    const maxAdults = room.maxAdults * selection.quantity;
    const maxChildren = room.maxChildren * selection.quantity;
    onChange({
      ...selection,
      guests: {
        adults: Math.min(guests.adults, maxAdults),
        children: Math.min(guests.children, maxChildren),
      },
    });
  };

  if (selection && selection.room !== room._id) {
    return null;
  }

  const quantity = selection?.quantity ?? 0;
  const adults = selection?.guests?.adults ?? 1;
  const children = selection?.guests?.children ?? 0;

  const containerVariants = reduceMotion ? {} : staggerContainer;
  const itemVariants = reduceMotion ? {} : slideUpFade;

  return (
    <RoomCardContainer
      className={cn(
        'rounded-xl overflow-hidden border border-primary/20 bg-surface transition-all duration-300',
        isSoldOut && 'opacity-50 pointer-events-none',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      custom={index}
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          <div className="relative w-full md:w-32 h-32 md:h-auto aspect-square rounded-lg overflow-hidden flex-shrink-0 bg-surface-container group">
            {room.images?.[0] ? (
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 20, ease: 'linear' }}
                style={{ overflow: 'hidden' }}
              >
                <Image
                  src={room.images[0]}
                  alt={roomName}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="128px"
                />
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-on-surface-variant">
                <Users size={24} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-display font-bold text-lg text-on-surface tracking-[-0.02em] text-wrap-balance">{roomName}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 capitalize">{room.roomType || 'room'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSoldOut ? (
                  <Badge variant="error" className="text-xs">
                    {t('soldOut')}
                  </Badge>
                ) : isLowAvailability ? (
                  <Badge variant="secondary" className="text-xs">
                    {t('unitsLeft', { count: availableUnits })}
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs">
                    {t('available')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {room.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium bg-surface-container text-on-surface-variant px-2 py-0.5 rounded"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="text-[10px] font-medium bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-3">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {t('maxGuests', { adults: room.maxAdults, children: room.maxChildren })}
              </span>
              <span className="flex items-center gap-1">
                <UserPlus size={14} />
                {totalUnits} {t('totalUnits')}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 pt-3 border-t border-outline-variant/20">
              <div className="text-right rtl:text-left">
                <span className="font-display font-bold text-xl text-primary tabular-nums">
                  {room.pricePerNight.toLocaleString()}
                </span>
                <span className="text-xs text-on-surface-variant ml-1 rtl:mr-1">
                  {t('perNight')}
                </span>
              </div>

              {!isSoldOut && (
                <div className="flex items-center gap-3 flex-wrap">
                  <QuantityStepper
                    value={quantity}
                    min={0}
                    max={maxQuantity}
                    onChange={handleQuantityChange}
                    disabled={isSoldOut}
                  />
                  {quantity > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
                    >
                      <span>{isExpanded ? t('hideGuests') : t('guests')}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>
              )}
            </div>

            {isExpanded && quantity > 0 && (
              <motion.div
                className="mt-4 pt-4 border-t border-outline-variant/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <GuestInput
                    label={t('adults')}
                    value={adults}
                    max={room.maxAdults * quantity}
                    onChange={(v) => handleGuestsChange({ adults: v, children })}
                    disabled={isSoldOut}
                  />
                  <GuestInput
                    label={t('children')}
                    value={children}
                    max={room.maxChildren * quantity}
                    onChange={(v) => handleGuestsChange({ adults, children: v })}
                    disabled={isSoldOut}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </RoomCardContainer>
  );
}