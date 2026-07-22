'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Check, Calendar, MapPin, DollarSign, Send, Mic, ArrowRight,
  Loader2, Sparkles, Building2, Shield, Percent, AlertCircle, RefreshCw,
} from 'lucide-react';
import { aiApi } from '@/lib/api/ai';
import { bookingsApi } from '@/lib/api/bookings';
import { paymentsApi } from '@/lib/api/payments';
import { hotelsApi } from '@/lib/api/hotels';
import { cn } from '@/lib/utils/cn';
import {
  useBookingConversation,
  useSendBookingMessage,
  useDeleteBookingConversation,
} from '@/hooks/useBookingConversation';
import type { BookingConversationState, HotelOption, ApiHotel, BookingChatMessage } from '@/lib/chat/types';

// ─── Localization ─────────────────────────────────────────────────────────────
const dict = {
  en: {
    plannerTitle: 'Rahal AI Assistant',
    plannerSubtitle: 'Planning your Cairo & Luxor Retreat',
    steps: { destination: 'Destination', dates: 'Dates', budget: 'Budget', hotels: 'Hotels', checkout: 'Checkout' },
    chatPlaceholder: 'Message Rahal AI...',
    suggestCairo: 'Suggest Cairo hotels',
    suggestLuxor: 'Suggest Luxor hotels',
    bestTime: "What's the best time to visit?",
    bookingSummary: 'Booking Summary',
    destinationLabel: 'DESTINATION',
    travelDatesLabel: 'TRAVEL DATES',
    budgetLevelLabel: 'BUDGET LEVEL',
    liveItinerary: 'LIVE ITINERARY',
    awaitingSelection: 'Awaiting selection...',
    estTotal: 'Est. Total',
    perksNotice: '*All optimized rates including exclusive Rahal perks.',
    confirmPay: 'Confirm & Pay',
    confirmPayActive: 'Confirm & Book Now',
    cairoEgypt: 'Cairo & Luxor, Egypt',
    datesDefault: 'Select your travel dates',
    budgetDefault: 'Luxury Heritage',
    bookingSuccessTitle: 'Redirecting to payment... 🎉',
    bookingSuccessDesc: 'Your booking is confirmed. Redirecting you to secure payment.',
    bookingId: 'Booking ID',
    returnBtn: 'Return to Planner',
    sessionExpired: "Previous session expired. Let's start a new journey!",
    aiTyping: 'Rahal is consulting the guides...',
    nights: 'nights',
    originalPrice: 'Original Price',
    rahalDiscount: 'Rahal Perks Discount',
    loadingHotels: 'Loading hotels...',
    noHotels: 'No hotels found for this destination.',
    quotaTitle: 'Monthly limit reached',
    quotaDesc: "You've used all 15,000 free tokens this month. Upgrade to Pro for unlimited AI planning.",
    quotaUpgrade: 'Upgrade to Pro →',
    quotaReset: 'Resets next month',
    selectHotelFirst: 'Please select a hotel before confirming.',
    bookingError: 'Failed to create booking. Please try again.',
    paymentError: 'Booking created but payment redirect failed. Please try again.',
    processingBooking: 'Creating your booking...',
    processingPayment: 'Redirecting to payment...',
    newTrip: 'New Booking',
    newTripConfirm: 'Start a new booking? Your current conversation will be cleared.',
    bookingSummaryTab: 'Summary',
    chatTab: 'Chat',
    connectionError: 'Something went wrong on our end. Please try again.',
  },
  ar: {
    plannerTitle: 'مساعد رحّال الذكي',
    plannerSubtitle: 'تخطيط رحلتك بين القاهرة والأقصر',
    steps: { destination: 'الوجهة', dates: 'التواريخ', budget: 'الميزانية', hotels: 'الفنادق', checkout: 'الدفع' },
    chatPlaceholder: 'اكتب رسالة إلى رحّال...',
    suggestCairo: 'اقترح فنادق في القاهرة',
    suggestLuxor: 'اقترح فنادق في الأقصر',
    bestTime: 'ما هو أفضل وقت للزيارة؟',
    bookingSummary: 'ملخص الحجز',
    destinationLabel: 'الوجهة',
    travelDatesLabel: 'تواريخ السفر',
    budgetLevelLabel: 'مستوى الميزانية',
    liveItinerary: 'خط السير المباشر',
    awaitingSelection: 'بانتظار الاختيار...',
    estTotal: 'المجموع التقديري',
    perksNotice: '*جميع الأسعار محسّنة وتشمل مزايا رحّال الحصرية.',
    confirmPay: 'تأكيد الدفع',
    confirmPayActive: 'تأكيد وحجز الرحلة',
    cairoEgypt: 'القاهرة والأقصر، مصر',
    datesDefault: 'اختار تاريخ',
    budgetDefault: 'تراث فاخر',
    bookingSuccessTitle: 'جاري التحويل للدفع... 🎉',
    bookingSuccessDesc: 'تم تأكيد حجزك. سيتم تحويلك لصفحة الدفع الآمن.',
    bookingId: 'رقم الحجز',
    returnBtn: 'العودة إلى المخطط',
    sessionExpired: 'انتهت الجلسة السابقة. لنبدأ رحلة جديدة الآن!',
    aiTyping: 'رحّال يقوم بالبحث والتخطيط...',
    nights: 'ليالي',
    originalPrice: 'السعر الأصلي',
    rahalDiscount: 'خصم مزايا رحّال',
    loadingHotels: 'جاري تحميل الفنادق...',
    noHotels: 'لا توجد فنادق لهذه الوجهة.',
    quotaTitle: 'تم الوصول للحد الشهري',
    quotaDesc: 'لقد استخدمت كل الـ 15,000 رمز المجاني هذا الشهر.',
    quotaUpgrade: 'الترقية إلى Pro ←',
    quotaReset: 'يتجدد الشهر القادم',
    selectHotelFirst: 'يرجى اختيار فندق قبل التأكيد.',
    bookingError: 'فشل إنشاء الحجز. يرجى المحاولة مرة أخرى.',
    paymentError: 'تم إنشاء الحجز لكن فشل التحويل للدفع.',
    processingBooking: 'جاري إنشاء حجزك...',
    processingPayment: 'جاري التحويل للدفع...',
    newTrip: 'حجز جديد',
    newTripConfirm: 'بدء حجز جديد؟ سيتم مسح المحادثة الحالية.',
    bookingSummaryTab: 'الملخص',
    chatTab: 'المحادثة',
    connectionError: 'عذراً، واجهنا مشكلة. يرجى المحاولة مرة أخرى.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BADGE_ORDER: Array<HotelOption['badge']> = ['top-pick', 'selected', 'best-value'];
const SECOND_LEG_CITIES = ['luxor', 'aswan', 'الأقصر', 'أسوان'];

function isSecondLegCity(city: string): boolean {
  return SECOND_LEG_CITIES.some((k) => city.toLowerCase().includes(k));
}

function mapApiHotel(hotel: ApiHotel, index: number, locale: 'en' | 'ar'): HotelOption {
  return {
    id: hotel._id,
    name: locale === 'ar' ? hotel.name.ar : hotel.name.en,
    pricePerNight: hotel.averagePricePerNight,
    location: hotel.city,
    image: hotel.coverImage || (hotel.images?.[0]) ||
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    badge: BADGE_ORDER[index] ?? null,
    insight: hotel.amenities?.[0] ? `Rahal Insight: ${hotel.amenities[0]}` : `Rahal Insight: ${hotel.stars}★ Hotel`,
    city: hotel.city,
  };
}

async function fetchHotelsByCity(city: string, limit = 3): Promise<ApiHotel[]> {
  const params = new URLSearchParams({ city, limit: String(limit), sort: '-stars' });
  const res = await fetch(`/api/v1/hotels?${params.toString()}`);
  if (!res.ok) throw new Error(`Hotel fetch failed: ${res.status}`);
  const json = await res.json();
  return (json.data as ApiHotel[]) ?? [];
}

async function fetchHotelByName(name: string): Promise<ApiHotel | null> {
  try {
    const res = await hotelsApi.getHotels({ search: name, limit: 5 });
    const results = ((res as any).data as ApiHotel[]) ?? [];
    if (results.length === 0) return null;
    const lowerName = name.toLowerCase();
    const exact = results.find((h) => h.name.en.toLowerCase() === lowerName || h.name.ar === name);
    return exact ?? results[0];
  } catch {
    return null;
  }
}

async function resolveHotelsForContext(
  userText: string, aiText: string,
  conversationCities: string[], locale: 'en' | 'ar'
): Promise<HotelOption[]> {
  const combined = `${userText} ${aiText}`.toLowerCase();
  let city = 'Cairo';
  if (combined.includes('marsa') || combined.includes('مرسى')) city = 'Marsa Alam';
  else if (combined.includes('luxor') || combined.includes('الأقصر')) city = 'Luxor';
  else if (combined.includes('aswan') || combined.includes('أسوان')) city = 'Aswan';
  else if (combined.includes('cairo') || combined.includes('القاهرة')) city = 'Cairo';
  else if (combined.includes('hurghada') || combined.includes('الغردقة')) city = 'Hurghada';
  else if (combined.includes('sharm') || combined.includes('شرم')) city = 'Sharm El Sheikh';
  else if (combined.includes('alex') || combined.includes('إسكندرية')) city = 'Alexandria';
  else city = conversationCities[0] ?? 'Cairo';

  try {
    const raw = await fetchHotelsByCity(city, 3);
    return raw.map((h, i) => mapApiHotel(h, i, locale));
  } catch { return []; }
}

function shouldShowHotels(_u: string, _a: string, step: string) {
  return step === 'hotel_selection' || step === 'preferences';
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }) as T;
}

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  'يناير': '01', 'فبراير': '02', 'مارس': '03', 'ابريل': '04', 'أبريل': '04',
  'مايو': '05', 'يونيو': '06', 'يوليو': '07', 'اغسطس': '08', 'أغسطس': '08',
  'سبتمبر': '09', 'اكتوبر': '10', 'أكتوبر': '10', 'نوفمبر': '11', 'ديسمبر': '12',
};

function lookupMonth(word: string): string | undefined {
  return MONTHS[word] ?? MONTHS[word.toLowerCase().slice(0, 3)];
}

function parseSingleDate(chunk: string, year: string): string | null {
  let m = chunk.match(/(\d{1,2})\s+([\p{L}]+)/u);
  if (m) {
    const month = lookupMonth(m[2]);
    if (month) return `${year}-${month}-${m[1].padStart(2, '0')}`;
  }
  m = chunk.match(/([\p{L}]+)\s+(\d{1,2})/u);
  if (m) {
    const month = lookupMonth(m[1]);
    if (month) return `${year}-${month}-${m[2].padStart(2, '0')}`;
  }
  return null;
}

function parseDatesFromText(text: string): { checkIn: string; checkOut: string } | null {
  const yearMatch = text.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
  const parts = text.split(/–|—|→|\bto\b|\bإلى\b|\bالى\b|-/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const checkIn = parseSingleDate(parts[0], year);
  const checkOut = parseSingleDate(parts[1], year);
  if (checkIn && checkOut) return { checkIn, checkOut };
  return null;
}

function extractTableCellValue(aiText: string, labelRegex: RegExp): string | null {
  for (const line of aiText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    const cells = trimmed.split('|').map((c) => c.replace(/\*+/g, '').trim()).filter((c) => c.length > 0);
    const idx = cells.findIndex((c) => labelRegex.test(c));
    if (idx !== -1 && cells[idx + 1]) return cells[idx + 1];
  }
  return null;
}

function extractConfirmedHotelName(aiText: string): string | null {
  const cleanName = (raw: string) => raw
    .replace(/\(.*?\)/g, '')
    .replace(/\*+/g, '')
    .replace(/[⭐★]+/g, '')
    .trim();

  const tableValue = extractTableCellValue(aiText, /^(?:hotel|الفندق)$/i);
  if (tableValue) return cleanName(tableValue);

  const patterns = [
    /[-•]\s*\*{0,2}\s*(?:hotel|الفندق)\s*\*{0,2}\s*[:\-]\s*\*{0,2}\s*(.+)/i,
    /\*{0,2}\s*(?:hotel|الفندق)\s*\*{0,2}\s*[:\-]\s*\*{0,2}\s*(.+)/i,
  ];
  for (const pattern of patterns) {
    const match = aiText.match(pattern);
    if (match) return cleanName(match[1].split(/\n|،|,/)[0]);
  }
  return null;
}

function extractConfirmedNights(aiText: string): number | null {
  const bullet = aiText.match(/(?:nights?|عدد الليالي)\s*[:\-]?\s*\*{0,2}\s*(\d+)/i);
  if (bullet) return parseInt(bullet[1], 10);

  const datesCell = extractTableCellValue(aiText, /^(?:dates?|التواريخ)$/i);
  if (datesCell) {
    const parsed = parseDatesFromText(datesCell);
    if (parsed) {
      const diff = Math.round(
        (new Date(parsed.checkOut).getTime() - new Date(parsed.checkIn).getTime()) / 86400000
      );
      if (diff > 0) return diff;
    }
  }
  return null;
}

function extractConfirmedGuestsRooms(aiText: string): { guests: number | null; rooms: number | null } {
  const guestsBullet = aiText.match(/(?:guests?|الضيوف)\s*[:\-]?\s*\*{0,2}\s*(\d+)/i);
  const roomsBullet = aiText.match(/(?:rooms?|الغرف)\s*[:\-]?\s*\*{0,2}\s*(\d+)/i);

  const guestsCell = extractTableCellValue(aiText, /^(?:guests?|عدد الضيوف|الضيوف)$/i);
  const roomsCell = extractTableCellValue(aiText, /^(?:rooms?|الغرف)$/i);

  const parseFirstNumber = (v: string | null) => {
    if (!v) return null;
    const m = v.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  };

  return {
    guests: guestsBullet ? parseInt(guestsBullet[1], 10) : parseFirstNumber(guestsCell),
    rooms: roomsBullet ? parseInt(roomsBullet[1], 10) : parseFirstNumber(roomsCell),
  };
}

function extractConfirmedTotal(aiText: string): number | null {
  const parseAmount = (v: string) => {
    const m = v.match(/([\d,]+)/);
    if (!m) return null;
    const val = parseInt(m[1].replace(/,/g, ''), 10);
    return Number.isFinite(val) ? val : null;
  };

  const bullet = aiText.match(/(?:total|الإجمالي)\s*[:\-]?\s*\*{0,2}\s*(?:egp|ج\.?م\.?|جنيه)?\s*([\d,]+)/i);
  if (bullet) return parseAmount(bullet[1]);

  const totalCell = extractTableCellValue(aiText, /(?:total|الإجمالي)/i);
  if (totalCell) return parseAmount(totalCell);

  return null;
}

function extractBudgetLabel(text: string, locale: 'en' | 'ar'): string | null {
  const lower = text.toLowerCase();

  const egpMatch = text.match(/(\d[\d,]*)\s*(?:egp|جنيه|ج\.?م\.?)/i);
  if (egpMatch) {
    const amount = egpMatch[1].replace(/,/g, '');
    return locale === 'ar' ? `${amount} ج.م / الليلة` : `EGP ${amount} / night`;
  }
  const usdMatch = text.match(/\$\s*(\d[\d,]*)/);
  if (usdMatch) {
    return locale === 'ar' ? `${usdMatch[1]}$ / الليلة` : `$${usdMatch[1]} / night`;
  }

  if (lower.includes('luxury') || lower.includes('فاخر') || lower.includes('فخم')) {
    return locale === 'ar' ? 'تراث فاخر' : 'Luxury Heritage';
  }
  if (lower.includes('mid-range') || lower.includes('mid range') || lower.includes('متوسط')) {
    return locale === 'ar' ? 'ميزانية متوسطة' : 'Mid-Range';
  }
  if (lower.includes('budget') || lower.includes('اقتصاد') || lower.includes('رخيص')) {
    return locale === 'ar' ? 'اقتصادية' : 'Budget-Friendly';
  }
  return null;
}

function nightsBetween(checkIn: string | null, checkOut: string | null, fallback: number): number {
  if (!checkIn || !checkOut) return fallback;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = Math.round((outDate.getTime() - inDate.getTime()) / 86400000);
  return diff > 0 ? diff : fallback;
}

function renderInlineBold(line: string, keyPrefix: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length > 0);
  return parts.map((part, j) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}-${j}`} className="font-bold text-on-surface">{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${j}`}>{part}</span>
    )
  );
}

function isTableRow(line: string) {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|') && t.length > 1;
}

function isTableSeparator(line: string) {
  const t = line.trim();
  if (!t.startsWith('|')) return false;
  return /^\|[\s:|-]+\|$/.test(t) && t.includes('-');
}

function parseTableRow(line: string): string[] {
  const t = line.trim();
  return t.slice(1, -1).split('|').map((c) => c.trim());
}

function renderTable(rows: string[][], key: string) {
  return (
    <div key={key} className="w-full overflow-x-auto my-2 rounded-xl border border-outline-variant bg-surface-container/40">
      <table className="w-full text-xs md:text-sm border-collapse">
        <tbody>
          {rows.map((cells, i) => (
            <tr
              key={i}
              className={cn(
                i % 2 === 0 ? 'bg-surface-container/30' : 'bg-transparent',
                i !== rows.length - 1 && 'border-b border-outline-variant/60'
              )}
            >
              {cells.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    'px-3 py-2 align-middle',
                    j === 0 && 'w-8 text-center shrink-0',
                    j === 1 && 'font-semibold text-on-surface-variant whitespace-nowrap',
                    j >= 2 && 'text-on-surface'
                  )}
                >
                  {renderInlineBold(cell, `td-${key}-${i}-${j}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderFormattedMessage(text: string) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];
  let i = 0;

  const flushList = (key: string) => {
    if (currentList.length === 0) return;
    blocks.push(
      <ul key={key} className="list-none m-0 p-0 flex flex-col gap-1 my-1">
        {currentList.map((item, idx) => (
          <li key={idx} className="flex items-start gap-1.5">
            <span className="text-secondary mt-1 shrink-0">•</span>
            <span>{renderInlineBold(item, `li-${key}-${idx}`)}</span>
          </li>
        ))}
      </ul>
    );
    currentList = [];
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (isTableRow(line) && lines[i + 1] && isTableSeparator(lines[i + 1])) {
      flushList(`list-${i}`);
      const tableLines = [line];
      let j = i + 2;
      while (j < lines.length && isTableRow(lines[j].trim())) {
        tableLines.push(lines[j].trim());
        j++;
      }
      blocks.push(renderTable(tableLines.map(parseTableRow), `table-${i}`));
      i = j;
      continue;
    }

    const bulletMatch = line.match(/^[-•]\s+(.*)/);
    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
      i++;
      continue;
    }
    flushList(`list-${i}`);

    if (line.length === 0) {
      blocks.push(<div key={`gap-${i}`} className="h-2" />);
      i++;
      continue;
    }
    blocks.push(<p key={`line-${i}`} className="m-0">{renderInlineBold(line, `p-${i}`)}</p>);
    i++;
  }
  flushList('list-end');

  return <div className="flex flex-col">{blocks}</div>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingConversationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as 'en' | 'ar';
  const t = dict[locale] ?? dict.en;
  const isRtl = locale === 'ar';
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Session ID from URL query param (not localStorage)
  const sessionId = searchParams.get('sessionId') ?? undefined;

  // React Query hooks - MUST be called unconditionally at top level (Rules of Hooks)
  const { data: conversation, isLoading: isLoadingConversation } = useBookingConversation(sessionId);
  const sendMessage = useSendBookingMessage(sessionId);
  const deleteConversation = useDeleteBookingConversation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, authLoading, router, locale]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Local UI state
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHotelsLoading, setIsHotelsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [conversationCities, setConversationCities] = useState<string[]>([]);
  const [travelDates, setTravelDates] = useState<string | null>(null);
  const [budgetLabel, setBudgetLabel] = useState<string | null>(null);
  const [parsedCheckIn, setParsedCheckIn] = useState<string | null>(null);
  const [parsedCheckOut, setParsedCheckOut] = useState<string | null>(null);

  // Optimistic messages (user messages sent but not yet confirmed by server)
  const [optimisticMessages, setOptimisticMessages] = useState<BookingChatMessage[]>([]);

  // Confirmed values from AI response
  const [confirmedNights, setConfirmedNights] = useState<number | null>(null);
  const [confirmedGuests, setConfirmedGuests] = useState<number | null>(null);
  const [confirmedRooms, setConfirmedRooms] = useState<number | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [lastConfirmedHotelName, setLastConfirmedHotelName] = useState<string | null>(null);

  // Hotel selections
  const [selectedPrimaryHotel, setSelectedPrimaryHotel] = useState<HotelOption | null>(null);
  const [selectedSecondaryHotel, setSelectedSecondaryHotel] = useState<HotelOption | null>(null);
  const [allSeenHotels, setAllSeenHotels] = useState<HotelOption[]>([]);

  // Refs for current values in callbacks
  const allSeenHotelsRef = useRef<HotelOption[]>([]);
  const selectedPrimaryHotelRef = useRef<HotelOption | null>(null);
  const selectedSecondaryHotelRef = useRef<HotelOption | null>(null);
  const lastConfirmedHotelNameRef = useRef<string | null>(null);

  useEffect(() => { allSeenHotelsRef.current = allSeenHotels; }, [allSeenHotels]);
  useEffect(() => { selectedPrimaryHotelRef.current = selectedPrimaryHotel; }, [selectedPrimaryHotel]);
  useEffect(() => { selectedSecondaryHotelRef.current = selectedSecondaryHotel; }, [selectedSecondaryHotel]);
  useEffect(() => { lastConfirmedHotelNameRef.current = lastConfirmedHotelName; }, [lastConfirmedHotelName]);

  // Scroll refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Derived state from conversation data
  const serverMessages = conversation?.data?.messages ?? [];
  // Merge server messages with optimistic messages (optimistic appear at the end)
  const messages = [...serverMessages, ...optimisticMessages];
  const currentStep = conversation?.data?.step ?? 'destination';
  const isCompleted = conversation?.data?.isComplete ?? false;
  const bookingId = conversation?.data?.bookingId ?? null;

  // Booking payment state
  const [bookingStep, setBookingStep] = useState<'idle' | 'creating' | 'paying' | 'done'>('idle');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [localBookingId, setLocalBookingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNewTripConfirm, setShowNewTripConfirm] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'summary'>('chat');

  // Scroll handling
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    if (isNearBottomRef.current) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleChatScroll = useCallback(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 120;
  }, []);

  // City extraction
  const extractCities = useCallback((text: string) => {
    const cityMap: Record<string, string> = {
      cairo: 'Cairo', 'القاهرة': 'Cairo', luxor: 'Luxor', 'الأقصر': 'Luxor',
      aswan: 'Aswan', 'أسوان': 'Aswan', hurghada: 'Hurghada', 'الغردقة': 'Hurghada',
      'marsa alam': 'Marsa Alam', 'مرسى علم': 'Marsa Alam',
      sharm: 'Sharm El Sheikh', 'شرم': 'Sharm El Sheikh',
      alexandria: 'Alexandria', 'إسكندرية': 'Alexandria',
    };
    const found: string[] = [];
    const lower = text.toLowerCase();
    for (const [key, city] of Object.entries(cityMap)) {
      if (lower.includes(key) && !found.includes(city)) found.push(city);
    }
    if (found.length > 0) {
      setConversationCities((prev) => {
        const merged = [...prev];
        for (const c of found) if (!merged.includes(c)) merged.push(c);
        return merged;
      });
    }
  }, []);

  // Date extraction
  const extractDates = useCallback((text: string) => {
    const patterns = [
      /(?:from\s+)?(\w+\s+\d{1,2})\s*(?:to|–|—|-)\s*(\w+\s+\d{1,2}(?:,?\s*\d{4})?)/i,
      /(\d{1,2}[\/\-]\d{1,2})\s*(?:to|–|—|-)\s*(\d{1,2}[\/\-]\d{1,2})/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        setTravelDates(`${match[1]} — ${match[2]}`);
        const parsed = parseDatesFromText(text);
        if (parsed) {
          setParsedCheckIn(parsed.checkIn);
          setParsedCheckOut(parsed.checkOut);
        }
        return;
      }
    }
  }, []);

  // Budget extraction
  const extractBudget = useCallback((text: string) => {
    const label = extractBudgetLabel(text, locale);
    if (label) setBudgetLabel(label);
  }, [locale]);

  // Hotel assignment logic
  const assignHotel = useCallback((hotel: HotelOption) => {
    const primary = selectedPrimaryHotelRef.current;
    const secondary = selectedSecondaryHotelRef.current;

    if (!primary) {
      setSelectedPrimaryHotel(hotel);
    } else if (isSecondLegCity(hotel.city) && !secondary) {
      setSelectedSecondaryHotel(hotel);
    } else if (primary.id !== hotel.id) {
      setSelectedPrimaryHotel(hotel);
    }
  }, []);

  // Hotel auto-select from user text
  const detectAndSelectHotel = useCallback((text: string, hotelCards: HotelOption[]) => {
    const trimmed = text.trim();

    const numericMatch = trimmed.match(/^[#]?\s*(\d)\s*$/) || trimmed.match(/^(?:رقم|فندق|hotel)?\s*(\d)\s*$/i);
    if (numericMatch) {
      const index = parseInt(numericMatch[1], 10) - 1;
      if (hotelCards[index]) {
        assignHotel(hotelCards[index]);
        return;
      }
    }

    const lower = text.toLowerCase();
    for (const hotel of hotelCards) {
      const nameWords = hotel.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      if (nameWords.some((w) => lower.includes(w))) {
        assignHotel(hotel);
        return;
      }
    }
  }, [assignHotel]);

  // Hotel confirm from AI text
  const confirmHotelFromAiText = useCallback(async (aiText: string, knownHotels: HotelOption[]) => {
    const confirmedName = extractConfirmedHotelName(aiText);
    if (!confirmedName) return;

    const lowerConfirmed = confirmedName.toLowerCase();

    for (const hotel of knownHotels) {
      const nameWords = hotel.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matches = hotel.name.toLowerCase() === lowerConfirmed
        || nameWords.some((w) => lowerConfirmed.includes(w));
      if (matches) {
        assignHotel(hotel);
        return;
      }
    }

    const apiHotel = await fetchHotelByName(confirmedName);
    if (!apiHotel) {
      const placeholder: HotelOption = {
        id: `pending-${Date.now()}`,
        name: confirmedName,
        pricePerNight: 0,
        location: '',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        badge: null,
        insight: '',
        city: '',
      };
      assignHotel(placeholder);
      return;
    }
    const hotel = mapApiHotel(apiHotel, 0, locale);
    setAllSeenHotels((prev) => (prev.some((h) => h.id === hotel.id) ? prev : [...prev, hotel]));
    assignHotel(hotel);
  }, [locale, assignHotel]);

  // Start fresh conversation
  const startFreshConversation = useCallback(() => {
    router.replace('/booking/conversation');
  }, [router]);

  // Handle new trip click
  const handleNewTripClick = useCallback(() => {
    if (messages.length > 1 || selectedPrimaryHotel || selectedSecondaryHotel) {
      setShowNewTripConfirm(true);
    } else {
      startFreshConversation();
    }
  }, [messages.length, selectedPrimaryHotel, selectedSecondaryHotel, startFreshConversation]);

  const confirmNewTrip = useCallback(async () => {
    setShowNewTripConfirm(false);
    if (sessionId) {
      await deleteConversation.mutateAsync(sessionId);
    }
    startFreshConversation();
  }, [sessionId, deleteConversation, startFreshConversation]);

  // Send message handler
  const handleSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    setError(null);
    setBookingError(null);
    extractCities(textToSend);
    extractDates(textToSend);
    extractBudget(textToSend);

    // Optimistically add user message
    const optimisticMsg: BookingChatMessage = {
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);

    setIsLoading(true);
    isNearBottomRef.current = true;

    const hotelsLikelyNeeded = shouldShowHotels(textToSend, '', currentStep);
    if (hotelsLikelyNeeded) setIsHotelsLoading(true);

    try {
      const [response, earlyHotelCards] = await Promise.all([
        sendMessage.mutateAsync(textToSend),
        hotelsLikelyNeeded
          ? resolveHotelsForContext(textToSend, '', conversationCities, locale).catch(() => [] as HotelOption[])
          : Promise.resolve(undefined as HotelOption[] | undefined),
      ]);

      // Clear optimistic message on success
      setOptimisticMessages([]);

      const data = response.data;
      const {
        sessionId: nextSessionId,
        step: nextStep,
        aiResponse: aiResponseRaw,
        isComplete: nextIsCompleted,
        bookingId: aiBookingId,
      } = data;

      const aiResponse = aiResponseRaw ?? '';

      // Update URL with sessionId if not already present
      if (!sessionId && nextSessionId) {
        router.replace(`/booking/conversation?sessionId=${nextSessionId}`);
      }

      extractCities(aiResponse);
      extractDates(aiResponse);

      const confirmedHotelNameThisTurn = extractConfirmedHotelName(aiResponse);

      let hotelCards = earlyHotelCards;
      if (!hotelCards && !confirmedHotelNameThisTurn && shouldShowHotels(textToSend, aiResponse, nextStep)) {
        setIsHotelsLoading(true);
        try {
          hotelCards = await resolveHotelsForContext(textToSend, aiResponse, conversationCities, locale);
        } finally { setIsHotelsLoading(false); }
      } else { setIsHotelsLoading(false); }

      if (!confirmedHotelNameThisTurn && hotelCards && hotelCards.length > 0) {
        setAllSeenHotels((prev) => {
          const merged = [...prev];
          for (const h of hotelCards!) if (!merged.some((m) => m.id === h.id)) merged.push(h);
          return merged;
        });
        detectAndSelectHotel(textToSend, hotelCards);
      }

      const knownHotelsSoFar = hotelCards && hotelCards.length > 0
        ? [...allSeenHotelsRef.current, ...hotelCards]
        : allSeenHotelsRef.current;

      await confirmHotelFromAiText(aiResponse, knownHotelsSoFar);

      // If AI confirmed a DIFFERENT hotel than what our bookingId belongs to, drop the old bookingId
      // The server response already reflects this, so we just invalidate to refetch
      if (confirmedHotelNameThisTurn && confirmedHotelNameThisTurn !== lastConfirmedHotelNameRef.current) {
        setLastConfirmedHotelName(confirmedHotelNameThisTurn);
      }

      // Pull authoritative numbers from AI confirmation
      const nights = extractConfirmedNights(aiResponse);
      if (nights !== null) setConfirmedNights(nights);
      const { guests, rooms } = extractConfirmedGuestsRooms(aiResponse);
      if (guests !== null) setConfirmedGuests(guests);
      if (rooms !== null) setConfirmedRooms(rooms);
      const total = extractConfirmedTotal(aiResponse);
      if (total !== null) setConfirmedTotal(total);

    } catch (err: any) {
      // Clear optimistic message on error
      setOptimisticMessages([]);
      setIsHotelsLoading(false);
      const httpStatus: number = err.statusCode ?? err.status ?? err.code ?? 0;
      const errMsg: string = (err.message ?? '').toLowerCase();

      if (httpStatus === 401 || errMsg.includes('unauthorized')) { router.push('/login'); return; }
      if (httpStatus === 429 || errMsg.includes('quota') || errMsg.includes('token limit') || errMsg.includes('limit reached')) {
        setQuotaExceeded(true); return;
      }

      const isSessionInvalid = httpStatus === 404
        || errMsg.includes('session not found')
        || errMsg.includes('invalid session')
        || errMsg.includes('session expired');

      if (isSessionInvalid && sessionId) {
        await deleteConversation.mutateAsync(sessionId);
        router.replace('/booking/conversation');
      } else {
        setError(t.connectionError);
      }
    } finally { setIsLoading(false); }
  }, [
    isLoading, sessionId, locale, currentStep, conversationCities,
    extractCities, extractDates, extractBudget, detectAndSelectHotel, confirmHotelFromAiText,
    t, router, sendMessage, deleteConversation
  ]);

  // Hotel card click handler
  const handleSelectHotelCard = useCallback((hotel: HotelOption) => {
    if (currentStep !== 'hotel_selection' && currentStep !== 'preferences') return;
    assignHotel(hotel);
    const msg = locale === 'ar' ? `أريد حجز فندق ${hotel.name}` : `I want to book the hotel ${hotel.name}`;
    handleSendMessage(msg);
  }, [currentStep, locale, handleSendMessage, assignHotel]);

  // Confirm & Pay handler
  const handleConfirmAndPay = useCallback(async () => {
    setBookingError(null);

    if (isCompleted && bookingId) {
      setBookingStep('paying');
      try {
        const payRes = await paymentsApi.bookingCheckout(bookingId);
        if ((payRes as any).status !== 'success') throw new Error('Payment session failed');
        const { url } = (payRes as any).data as { url: string };
        if (!url) throw new Error('No payment URL returned');

        setBookingStep('done');
        setShowSuccessModal(true);
        setTimeout(() => { window.location.href = url; }, 1500);
      } catch (err: any) {
        setBookingStep('idle');
        setBookingError(t.paymentError);
        console.error('Payment error:', err);
      }
      return;
    }

    if (isCompleted && !bookingId) {
      setBookingError(t.bookingError);
      console.error('AI marked booking complete but no bookingId was received.');
      return;
    }

    let hotelToBook = selectedPrimaryHotel ?? selectedSecondaryHotel;
    if (!hotelToBook) {
      setBookingError(t.selectHotelFirst);
      return;
    }

    if (hotelToBook.id.startsWith('pending-')) {
      const found = await fetchHotelByName(hotelToBook.name);
      if (!found) {
        setBookingError(t.bookingError);
        return;
      }
      hotelToBook = mapApiHotel(found, 0, locale);
    }

    setBookingStep('creating');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let checkInDate = parsedCheckIn ? new Date(parsedCheckIn) : null;
      let checkOutDate = parsedCheckOut ? new Date(parsedCheckOut) : null;

      if (!checkInDate || checkInDate < today) {
        checkInDate = new Date(Date.now() + 7 * 86400000);
      }
      if (!checkOutDate || checkOutDate <= checkInDate) {
        checkOutDate = new Date(checkInDate.getTime() + 4 * 86400000);
      }

      const checkIn = checkInDate.toISOString().split('T')[0];
      const checkOut = checkOutDate.toISOString().split('T')[0];

      const roomsPayload = [{
        room: hotelToBook.id,
        quantity: confirmedRooms ?? 1,
        guests: { adults: confirmedGuests ?? 1, children: 0 },
      }];

      const bookingRes = await bookingsApi.createBooking({
        hotel: hotelToBook.id,
        checkIn,
        checkOut,
        guests: confirmedGuests ?? 1,
        rooms: roomsPayload,
      });

      if ((bookingRes as any).status !== 'success') throw new Error('Booking creation failed');
      const createdBooking = (bookingRes as any).data as { _id?: string; id?: string };
      const createdId = createdBooking._id ?? createdBooking.id;
      if (!createdId) throw new Error('No booking ID returned');
      setLocalBookingId(createdId);

      setBookingStep('paying');
      const payRes = await paymentsApi.bookingCheckout(createdId);
      if ((payRes as any).status !== 'success') throw new Error('Payment session failed');
      const { url } = (payRes as any).data as { url: string };

      if (!url) throw new Error('No payment URL returned');

      setBookingStep('done');
      setShowSuccessModal(true);
      setTimeout(() => { window.location.href = url; }, 1500);

    } catch (err: any) {
      setBookingStep('idle');
      const isPaymentErr = bookingId !== null;
      setBookingError(isPaymentErr ? t.paymentError : t.bookingError);
      console.error('Booking/payment error:', err);
    }
  }, [isCompleted, bookingId, selectedPrimaryHotel, selectedSecondaryHotel, parsedCheckIn, parsedCheckOut, confirmedGuests, confirmedRooms, t, locale]);

  // Step wizard
  const steps = [
    { id: 'destination', label: t.steps.destination, icon: MapPin },
    { id: 'dates',       label: t.steps.dates,       icon: Calendar },
    { id: 'budget',      label: t.steps.budget,      icon: DollarSign },
    { id: 'hotels',      label: t.steps.hotels,      icon: Building2 },
    { id: 'checkout',    label: t.steps.checkout,    icon: Check },
  ];

  const getStepIndex = (s: string) => {
    const map: Record<string, number> = {
      destination: 0, dates: 1, budget: 2,
      preferences: 3, hotel_selection: 3,
      guest_info: 4, payment: 4, complete: 4,
    };
    return map[s] ?? 0;
  };

  const currentStepIndex = getStepIndex(currentStep);
  const isBookingInProgress = bookingStep === 'creating' || bookingStep === 'paying';

  // Pricing
  const primaryDays = confirmedNights ?? nightsBetween(parsedCheckIn, parsedCheckOut, 3);
  const secondaryDays = confirmedNights ?? nightsBetween(parsedCheckIn, parsedCheckOut, 4);
  const primaryBase = selectedPrimaryHotel ? selectedPrimaryHotel.pricePerNight * primaryDays : 0;
  const secondaryBase = selectedSecondaryHotel ? selectedSecondaryHotel.pricePerNight * secondaryDays : 0;
  const estimatedTotal = primaryBase + secondaryBase;
  const optimizedTotal = estimatedTotal > 0 ? Math.round(estimatedTotal * 0.83768) : 0;
  const currentTotal = confirmedTotal ?? estimatedTotal;
  const displayedTotal = confirmedTotal ?? optimizedTotal;

  if (isLoadingConversation) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-surface text-on-surface">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <span className="font-display font-medium text-lg">Loading conversation...</span>
      </div>
    );
  }

  return (
    <main
      className={cn('flex-1 w-full bg-surface text-on-surface pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-5 sm:gap-8', isRtl ? 'font-body' : 'font-body')}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* ── Stepper ── */}
      <section className="w-full bg-surface/70 backdrop-blur-md border border-outline-variant rounded-2xl p-4 sm:p-6 md:py-8 flex flex-row md:flex-row items-center justify-between gap-2 sm:gap-4 relative overflow-hidden overflow-x-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-accent/5 to-transparent pointer-events-none" />
        {steps.map((step, idx) => {
          const isCompletedStep = idx < currentStepIndex || bookingStep === 'done';
          const isActive = idx === currentStepIndex && bookingStep !== 'done';
          const StepIcon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 z-10 shrink-0 select-none">
                <div className={cn(
                  'w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold',
                  isCompletedStep && 'bg-primary border-primary text-bg shadow-md shadow-sm',
                  isActive && 'bg-surface-container border-primary text-primary shadow-md animate-pulse',
                  !isCompletedStep && !isActive && 'bg-surface-container-low border-outline-variant text-outline'
                )}>
                  {isCompletedStep ? <Check size={16} className="stroke-[3px] sm:!w-5 sm:!h-5" />
                    : isActive ? <StepIcon size={16} className="animate-pulse sm:!w-5 sm:!h-5" />
                    : <span className="text-xs sm:text-base">{idx + 1}</span>}
                </div>
                <span className={cn(
                  'text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap',
                  isCompletedStep && 'text-primary', isActive && 'text-on-surface font-bold',
                  !isCompletedStep && !isActive && 'text-outline'
                )}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  'block h-[2px] sm:h-[3px] flex-1 mx-1 sm:mx-2 rounded-full transition-all duration-500 min-w-[12px]',
                  idx < currentStepIndex || bookingStep === 'done' ? 'bg-primary shadow-md' : 'bg-border'
                )} />
              )}
            </React.Fragment>
          );
        })}
      </section>

      {/* ── Mobile tab switcher ── */}
      <div className="lg:hidden flex gap-2 -mb-2">
        <button type="button" onClick={() => setMobileTab('chat')}
          className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors',
            mobileTab === 'chat' ? 'bg-primary text-bg border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant')}>
          {t.chatTab}
        </button>
        <button type="button" onClick={() => setMobileTab('summary')}
          className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors',
            mobileTab === 'summary' ? 'bg-primary text-bg border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant')}>
          {t.bookingSummaryTab}
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">

        {/* Left: Chat */}
        <section className={cn(
          'lg:col-span-8 flex flex-col bg-surface-container-low rounded-2xl p-0 border border-outline-variant overflow-hidden shadow-sm hover:shadow-md',
          'h-[70vh] sm:h-[600px] lg:h-[750px]',
          mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
        )}>
          {/* header */}
          <div className="p-3 sm:p-4 border-b border-outline-variant bg-surface-container/50 flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xs sm:text-sm md:text-base font-bold text-on-surface flex items-center gap-1.5">
                {t.plannerTitle}
                <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
              </h2>
              <p className="text-[10px] sm:text-xs text-on-surface-variant truncate">{t.plannerSubtitle}</p>
            </div>
            <button type="button" onClick={handleNewTripClick} title={t.newTrip}
              className="shrink-0 flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-on-surface-variant hover:text-primary border border-outline-variant hover:border-primary/40 bg-surface-container-low hover:bg-primary/5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors cursor-pointer">
              <RefreshCw size={13} />
              <span className="hidden sm:inline">{t.newTrip}</span>
            </button>
          </div>

          {/* chat feed */}
          <div ref={chatScrollRef} onScroll={handleChatScroll}
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 scrollbar-thin"
            aria-live="polite">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={`${index}-${msg.createdAt ?? ''}`} className={cn('flex flex-col max-w-[92%] sm:max-w-[85%] animate-fade-in', isUser ? 'self-end items-end' : 'self-start items-start')}>
                  <div className={cn('p-3 sm:p-4 text-sm md:text-base leading-relaxed break-words shadow-sm', isUser ? 'bg-primary text-on-primary rounded-2xl rounded-br-sm font-medium' : 'bg-surface-container text-on-surface rounded-2xl rounded-bl-sm border-s-[3px] border-secondary')}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    ) : (
                      renderFormattedMessage(msg.content)
                    )}
                  </div>
                  <span className="text-[10px] text-outline mt-1.5 px-1.5 flex items-center gap-1">
                    {isUser && <Check size={10} className="text-primary shrink-0" />}
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>

                  {/* Hotel cards */}
                  {!isUser && (msg as any).hotels && (msg as any).hotels.length > 0 && (
                    <div className="w-full mt-4 overflow-x-auto pb-2 flex gap-3 sm:gap-4 select-none scrollbar-thin max-w-full">
                      {((msg as any).hotels as HotelOption[]).map((hotel) => {
                        const isSelected = selectedPrimaryHotel?.id === hotel.id || selectedSecondaryHotel?.id === hotel.id;
                        return (
                          <div key={hotel.id} onClick={() => handleSelectHotelCard(hotel)}
                            className={cn(
                              'flex-none w-52 sm:w-64 md:w-72 bg-surface-container-low border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:translate-y-[-4px]',
                              isSelected ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-outline-variant hover:border-outline-variant-glow hover:shadow-md'
                            )}>
                            <div className="h-28 sm:h-32 w-full relative bg-surface-container">
                              <img src={hotel.image} alt={hotel.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                              {hotel.badge && (
                                <span className={cn(
                                  'absolute top-2.5 right-2.5 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm z-10',
                                  hotel.badge === 'top-pick' && 'bg-primary text-bg',
                                  hotel.badge === 'selected' && 'bg-secondary text-bg',
                                  hotel.badge === 'best-value' && 'bg-success text-bg'
                                )}>
                                  {hotel.badge === 'top-pick' ? (locale === 'ar' ? 'أفضل خيار' : 'TOP PICK')
                                    : hotel.badge === 'selected' ? (locale === 'ar' ? 'مختار' : 'SELECTED')
                                    : (locale === 'ar' ? 'أفضل قيمة' : 'BEST VALUE')}
                                </span>
                              )}
                            </div>
                            <div className="p-3 sm:p-4 flex flex-col gap-2">
                              <div className="flex justify-between items-start gap-1">
                                <h3 className="text-xs md:text-sm font-bold text-on-surface line-clamp-1">{hotel.name}</h3>
                                <span className="text-xs md:text-sm font-extrabold text-primary shrink-0">
                                  ${hotel.pricePerNight}<span className="text-[10px] font-normal text-outline">/{locale === 'ar' ? 'ل' : 'nt'}</span>
                                </span>
                              </div>
                              <p className="text-[10px] md:text-xs text-on-surface-variant flex items-center gap-1">
                                <MapPin size={10} className="text-outline" />{hotel.location}
                              </p>
                              <span className="inline-flex items-center rounded-full bg-secondary/10 text-secondary py-1 font-semibold text-[10px] border border-secondary/15">
                                {hotel.insight}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="self-start flex flex-col max-w-[80%] animate-fade-in">
                <div className="bg-surface-container text-on-surface rounded-2xl rounded-bl-sm p-4 flex items-center gap-2.5">
                  <span className="text-xs text-on-surface-variant">{t.aiTyping}</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {isHotelsLoading && (
              <div className="self-start flex items-center gap-2 text-xs text-on-surface-variant animate-fade-in px-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>{t.loadingHotels}</span>
              </div>
            )}

            {quotaExceeded && (
              <div className="self-center w-full max-w-[92%] rounded-2xl overflow-hidden border border-primary/30 shadow-md animate-fade-in">
                <div className="bg-primary/10 px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-bold text-on-surface">{t.quotaTitle}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{t.quotaDesc}</p>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-[10px] text-outline">{t.quotaReset}</span>
                    <a href="/pricing" className="bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all text-xs px-4 py-1.5 font-semibold no-underline">{t.quotaUpgrade}</a>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="self-center bg-error/10 border border-error/25 text-error rounded-xl p-3 max-w-[90%] text-xs text-center flex items-center gap-2">
                <Shield size={14} className="shrink-0" /><span>{error}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          {!isLoading && messages.length > 0 && !quotaExceeded && (
            <div className="px-3 sm:px-4 py-2 flex flex-wrap gap-2 border-t border-outline-variant bg-surface-container-low z-10">
              {currentStep === 'destination' && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'أريد زيارة القاهرة والأقصر' : 'I want to visit Cairo and Luxor')}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {locale === 'ar' ? 'رحلة القاهرة والأقصر' : 'Cairo & Luxor retreat'}
                  </button>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'رحلة بحرية في مرسى علم' : 'A trip to Marsa Alam beach resort')}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {locale === 'ar' ? 'منتجع مرسى علم' : 'Marsa Alam resort'}
                  </button>
                </>
              )}
              {currentStep === 'dates' && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'من ١٢ أكتوبر إلى ٢٠ أكتوبر ٢٠٢٤' : 'From Oct 12 to Oct 20, 2024')}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {t.datesDefault}
                  </button>
                  <button onClick={() => handleSendMessage(t.bestTime)}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {t.bestTime}
                  </button>
                </>
              )}
              {currentStep === 'budget' && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'ميزانية تراثية فاخرة' : 'Luxury heritage budget')}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {t.budgetDefault}
                  </button>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'ميزانية متوسطة' : 'Mid-range budget ($50 - $150)')}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {locale === 'ar' ? 'ميزانية متوسطة' : 'Mid-range budget'}
                  </button>
                </>
              )}
              {(currentStep === 'hotel_selection' || currentStep === 'preferences') && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'اقترح فنادق مطلة على النيل بالقاهرة' : 'Suggest Cairo hotels with Nile views')}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {t.suggestCairo}
                  </button>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'اقترح فنادق في الأقصر' : 'Suggest Luxor hotels')}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {t.suggestLuxor}
                  </button>
                </>
              )}
              {currentStep === 'payment' && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'سأدفع ببطاقة ائتمان' : "I'll pay by credit card")}
                    className="bg-transparent hover:bg-surface-container rounded-lg transition-colors text-xs py-1.5 px-3 border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-on-surface font-medium bg-surface-container/40">
                    {locale === 'ar' ? 'بطاقة ائتمان' : 'Credit card'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Input bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(draft); setDraft(''); }}
            className="p-3 sm:p-4 border-t border-outline-variant bg-surface-container/30 flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 flex items-center min-w-0">
              <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
                placeholder={t.chatPlaceholder}
                disabled={isLoading || bookingStep === 'done' || quotaExceeded}
                className="rounded-lg border border-outline-variant px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 w-full bg-surface-container-low pr-12" />
              <button type="button" aria-label="Voice input"
                className="absolute right-3.5 text-outline hover:text-primary cursor-pointer p-1 rounded-full transition-colors border-none bg-transparent">
                <Mic size={18} />
              </button>
            </div>
            <button type="submit"
              disabled={!draft.trim() || isLoading || bookingStep === 'done' || quotaExceeded}
              className={cn(
                'w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-primary text-bg flex items-center justify-center transition-all cursor-pointer border-none shrink-0',
                (!draft.trim() || isLoading || bookingStep === 'done' || quotaExceeded) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-md'
              )}>
              <Send size={18} className={cn(isRtl && 'rotate-180')} />
            </button>
          </form>
        </section>

        {/* Right: Booking Summary */}
        <section className={cn(
          'lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24',
          mobileTab === 'summary' ? 'flex' : 'hidden lg:flex'
        )}>
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant shadow-sm hover:shadow-md p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
            <h2 className="font-display text-base md:text-lg font-bold border-b border-outline-variant pb-3 flex items-center justify-between">
              {t.bookingSummary}
              <Building2 className="w-5 h-5 text-primary" />
            </h2>

            <div className="flex flex-col gap-4">
              {/* Destination */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-outline tracking-widest block">{t.destinationLabel}</span>
                  <span className="text-sm font-semibold text-on-surface truncate block">
                    {conversationCities.length > 0
                      ? conversationCities.join(' & ') + (locale === 'ar' ? '، مصر' : ', Egypt')
                      : t.awaitingSelection}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-outline tracking-widest block">{t.travelDatesLabel}</span>
                  <span className="text-sm font-semibold text-on-surface truncate block">
                    {travelDates ?? t.awaitingSelection}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
                  <DollarSign size={18} className="text-primary" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-outline tracking-widest block">{t.budgetLevelLabel}</span>
                  <span className="text-sm font-semibold text-on-surface truncate block">
                    {budgetLabel ?? t.awaitingSelection}
                  </span>
                </div>
              </div>
            </div>

            {/* Live itinerary */}
            <div className="border-t border-outline-variant pt-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-outline tracking-wider uppercase block">{t.liveItinerary}</span>
              <div className="flex justify-between items-start gap-2">
                <div className="pl-4 border-l-2 border-primary/40 flex flex-col">
                  <span className="text-xs font-bold text-on-surface">
                    {conversationCities[0] ?? (locale === 'ar' ? 'القاهرة' : 'Cairo')}
                    {selectedPrimaryHotel && travelDates ? ` · ${travelDates}` : ''}
                  </span>
                  <span className="text-[11px] text-on-surface-variant truncate">
                    {selectedPrimaryHotel ? selectedPrimaryHotel.name : t.awaitingSelection}
                  </span>
                </div>
                {selectedPrimaryHotel && (
                  <span className="text-xs font-extrabold text-on-surface shrink-0">
                    ${selectedPrimaryHotel.pricePerNight * primaryDays}
                  </span>
                )}
              </div>
              {conversationCities.length > 1 && (
                <div className="flex justify-between items-start gap-2 mt-2">
                  <div className="pl-4 border-l-2 border-outline-variant/60 flex flex-col">
                    <span className="text-xs font-bold text-on-surface">
                      {conversationCities[1] ?? (locale === 'ar' ? 'الأقصر' : 'Luxor')}
                    </span>
                    <span className="text-[11px] text-outline italic">
                      {selectedSecondaryHotel ? selectedSecondaryHotel.name : t.awaitingSelection}
                    </span>
                  </div>
                  {selectedSecondaryHotel && (
                    <span className="text-xs font-extrabold text-on-surface shrink-0">
                      ${selectedSecondaryHotel.pricePerNight * secondaryDays}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pricing */}
            {currentTotal > 0 ? (
              <div className="border-t border-outline-variant pt-4 flex flex-col gap-2">
                {confirmedTotal === null && (
                  <>
                    <div className="flex justify-between items-center text-xs text-outline">
                      <span>{t.originalPrice}</span>
                      <span className="line-through">${currentTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-secondary">
                      <span className="flex items-center gap-1"><Percent size={12} />{t.rahalDiscount}</span>
                      <span>-${currentTotal - optimizedTotal}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-sm font-bold text-on-surface">{t.estTotal}</span>
                  <span className="font-display text-xl md:text-2xl font-extrabold text-primary">
                    {locale === 'ar' ? `${displayedTotal.toLocaleString()} ج.م` : `$${displayedTotal.toLocaleString()}`}
                    {confirmedTotal === null && '*'}
                  </span>
                </div>
                {confirmedTotal === null && (
                  <span className="text-[10px] text-outline leading-normal border-t border-outline-variant/5 pt-2 text-center block">
                    {t.perksNotice}
                  </span>
                )}
              </div>
            ) : (
              <div className="border-t border-outline-variant pt-4 text-xs text-outline text-center">
                {t.awaitingSelection}
              </div>
            )}

            {/* Booking error */}
            {bookingError && (
              <div className="bg-error/10 border border-error/25 text-error rounded-xl p-3 text-xs flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Confirm & Pay button */}
            <button
              onClick={handleConfirmAndPay}
              disabled={(currentStepIndex < 3 && !isCompleted) || isBookingInProgress || bookingStep === 'done'}
              className={cn(
                'bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all w-full py-3.5 flex items-center justify-center gap-2',
                ((currentStepIndex < 3 && !isCompleted) || isBookingInProgress || bookingStep === 'done') && 'opacity-40 cursor-not-allowed'
              )}
            >
              {isBookingInProgress ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="font-semibold text-sm md:text-base">
                    {bookingStep === 'creating' ? t.processingBooking : t.processingPayment}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-sm md:text-base">
                    {currentStepIndex >= 3 || isCompleted ? t.confirmPayActive : t.confirmPay}
                  </span>
                  <ArrowRight size={18} className={cn(isRtl && 'rotate-180', 'shrink-0')} />
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* ── New trip confirmation modal ── */}
      {showNewTripConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-low rounded-2xl border border-outline-variant shadow-2xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
              <RefreshCw size={22} />
            </div>
            <p className="text-sm text-on-surface leading-relaxed">{t.newTripConfirm}</p>
            <div className="flex w-full gap-3 mt-2">
              <button onClick={() => setShowNewTripConfirm(false)}
                className="bg-transparent hover:bg-surface-container rounded-lg transition-colors flex-1 py-2.5 border border-outline-variant text-on-surface-variant hover:text-on-surface font-medium text-sm">
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={confirmNewTrip} className="bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all flex-1 py-2.5 font-semibold text-sm">
                {t.newTrip}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-low rounded-2xl border border-outline-variant shadow-2xl p-6 md:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary mb-6 shadow-md animate-pulse">
              <Sparkles size={32} />
            </div>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-on-surface mb-3">
              {t.bookingSuccessTitle}
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{t.bookingSuccessDesc}</p>
            {bookingId && (
              <div className="w-full bg-surface-container/60 border border-outline-variant rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-outline font-bold">{t.bookingId}</span>
                  <span className="text-primary font-mono font-bold tracking-wider">{bookingId}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span>{locale === 'ar' ? 'جاري التحويل...' : 'Redirecting to payment...'}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}