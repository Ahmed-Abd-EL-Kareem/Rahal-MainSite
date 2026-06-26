// 'use client';

// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { useLocale } from 'next-intl';
// import {
//   Check, Calendar, MapPin, DollarSign, Send, Mic, ArrowRight,
//   Loader2, Sparkles, Building2, Shield, Percent, AlertCircle, RefreshCw,
// } from 'lucide-react';
// import { aiApi } from '@/lib/api/ai';
// import { bookingsApi } from '@/lib/api/bookings';
// import { paymentsApi } from '@/lib/api/payments';
// import { cn } from '@/lib/utils/cn';

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   step?: string;
//   timestamp: Date;
//   hotels?: HotelOption[];
// }

// interface HotelOption {
//   id: string;
//   name: string;
//   pricePerNight: number;
//   location: string;
//   image: string;
//   badge: 'top-pick' | 'selected' | 'best-value' | null;
//   insight: string;
//   city: string;
// }

// interface ApiHotel {
//   _id: string;
//   name: { en: string; ar: string };
//   city: string;
//   averagePricePerNight: number;
//   currency: string;
//   stars: number;
//   coverImage?: string;
//   images?: string[];
//   amenities?: string[];
// }

// // ─── Localization ─────────────────────────────────────────────────────────────
// const dict = {
//   en: {
//     plannerTitle: 'Rahal AI Assistant',
//     plannerSubtitle: 'Planning your Cairo & Luxor Retreat',
//     steps: { destination: 'Destination', dates: 'Dates', budget: 'Budget', hotels: 'Hotels', checkout: 'Checkout' },
//     chatPlaceholder: 'Message Rahal AI...',
//     suggestCairo: 'Suggest Cairo hotels',
//     suggestLuxor: 'Suggest Luxor hotels',
//     bestTime: "What's the best time to visit?",
//     bookingSummary: 'Booking Summary',
//     destinationLabel: 'DESTINATION',
//     travelDatesLabel: 'TRAVEL DATES',
//     budgetLevelLabel: 'BUDGET LEVEL',
//     liveItinerary: 'LIVE ITINERARY',
//     awaitingSelection: 'Awaiting selection...',
//     estTotal: 'Est. Total',
//     perksNotice: '*All optimized rates including exclusive Rahal perks.',
//     confirmPay: 'Confirm & Pay',
//     confirmPayActive: 'Confirm & Book Now',
//     cairoEgypt: 'Cairo & Luxor, Egypt',
//     datesDefault: 'Select your travel dates',
//     budgetDefault: 'Luxury Heritage',
//     bookingSuccessTitle: 'Redirecting to payment... 🎉',
//     bookingSuccessDesc: 'Your booking is confirmed. Redirecting you to secure payment.',
//     bookingId: 'Booking ID',
//     returnBtn: 'Return to Planner',
//     sessionExpired: "Previous session expired. Let's start a new journey!",
//     aiTyping: 'Rahal is consulting the guides...',
//     nights: 'nights',
//     originalPrice: 'Original Price',
//     rahalDiscount: 'Rahal Perks Discount',
//     loadingHotels: 'Loading hotels...',
//     noHotels: 'No hotels found for this destination.',
//     quotaTitle: 'Monthly limit reached',
//     quotaDesc: "You've used all 15,000 free tokens this month. Upgrade to Pro for unlimited AI planning.",
//     quotaUpgrade: 'Upgrade to Pro →',
//     quotaReset: 'Resets next month',
//     selectHotelFirst: 'Please select a hotel before confirming.',
//     bookingError: 'Failed to create booking. Please try again.',
//     paymentError: 'Booking created but payment redirect failed. Please try again.',
//     processingBooking: 'Creating your booking...',
//     processingPayment: 'Redirecting to payment...',
//     newTrip: 'New Trip',
//     newTripConfirm: 'Start a new trip? Your current conversation will be cleared.',
//   },
//   ar: {
//     plannerTitle: 'مساعد رحّال الذكي',
//     plannerSubtitle: 'تخطيط رحلتك بين القاهرة والأقصر',
//     steps: { destination: 'الوجهة', dates: 'التواريخ', budget: 'الميزانية', hotels: 'الفنادق', checkout: 'الدفع' },
//     chatPlaceholder: 'اكتب رسالة إلى رحّال...',
//     suggestCairo: 'اقترح فنادق في القاهرة',
//     suggestLuxor: 'اقترح فنادق في الأقصر',
//     bestTime: 'ما هو أفضل وقت للزيارة؟',
//     bookingSummary: 'ملخص الحجز',
//     destinationLabel: 'الوجهة',
//     travelDatesLabel: 'تواريخ السفر',
//     budgetLevelLabel: 'مستوى الميزانية',
//     liveItinerary: 'خط السير المباشر',
//     awaitingSelection: 'بانتظار الاختيار...',
//     estTotal: 'المجموع التقديري',
//     perksNotice: '*جميع الأسعار محسّنة وتشمل مزايا رحّال الحصرية.',
//     confirmPay: 'تأكيد الدفع',
//     confirmPayActive: 'تأكيد وحجز الرحلة',
//     cairoEgypt: 'القاهرة والأقصر، مصر',
//     datesDefault: 'اختار تاريخ',
//     budgetDefault: 'تراث فاخر',
//     bookingSuccessTitle: 'جاري التحويل للدفع... 🎉',
//     bookingSuccessDesc: 'تم تأكيد حجزك. سيتم تحويلك لصفحة الدفع الآمن.',
//     bookingId: 'رقم الحجز',
//     returnBtn: 'العودة إلى المخطط',
//     sessionExpired: 'انتهت الجلسة السابقة. لنبدأ رحلة جديدة الآن!',
//     aiTyping: 'رحّال يقوم بالبحث والتخطيط...',
//     nights: 'ليالي',
//     originalPrice: 'السعر الأصلي',
//     rahalDiscount: 'خصم مزايا رحّال',
//     loadingHotels: 'جاري تحميل الفنادق...',
//     noHotels: 'لا توجد فنادق لهذه الوجهة.',
//     quotaTitle: 'تم الوصول للحد الشهري',
//     quotaDesc: 'لقد استخدمت كل الـ 15,000 رمز المجاني هذا الشهر.',
//     quotaUpgrade: 'الترقية إلى Pro ←',
//     quotaReset: 'يتجدد الشهر القادم',
//     selectHotelFirst: 'يرجى اختيار فندق قبل التأكيد.',
//     bookingError: 'فشل إنشاء الحجز. يرجى المحاولة مرة أخرى.',
//     paymentError: 'تم إنشاء الحجز لكن فشل التحويل للدفع.',
//     processingBooking: 'جاري إنشاء حجزك...',
//     processingPayment: 'جاري التحويل للدفع...',
//     newTrip: 'رحلة جديدة',
//     newTripConfirm: 'بدء رحلة جديدة؟ سيتم مسح المحادثة الحالية.',
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const BADGE_ORDER: Array<HotelOption['badge']> = ['top-pick', 'selected', 'best-value'];

// function mapApiHotel(hotel: ApiHotel, index: number, locale: 'en' | 'ar'): HotelOption {
//   return {
//     id: hotel._id,
//     name: locale === 'ar' ? hotel.name.ar : hotel.name.en,
//     pricePerNight: hotel.averagePricePerNight,
//     location: hotel.city,
//     image: hotel.coverImage || (hotel.images?.[0]) ||
//       'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
//     badge: BADGE_ORDER[index] ?? null,
//     insight: hotel.amenities?.[0] ? `Rahal Insight: ${hotel.amenities[0]}` : `Rahal Insight: ${hotel.stars}★ Hotel`,
//     city: hotel.city,
//   };
// }

// async function fetchHotelsByCity(city: string, limit = 3): Promise<ApiHotel[]> {
//   const params = new URLSearchParams({ city, limit: String(limit), sort: '-stars' });
//   const res = await fetch(`/api/v1/hotels?${params.toString()}`);
//   if (!res.ok) throw new Error(`Hotel fetch failed: ${res.status}`);
//   const json = await res.json();
//   return (json.data as ApiHotel[]) ?? [];
// }

// async function resolveHotelsForContext(
//   userText: string, aiText: string,
//   conversationCities: string[], locale: 'en' | 'ar'
// ): Promise<HotelOption[]> {
//   const combined = `${userText} ${aiText}`.toLowerCase();
//   let city = 'Cairo';
//   if (combined.includes('marsa') || combined.includes('مرسى')) city = 'Marsa Alam';
//   else if (combined.includes('luxor') || combined.includes('الأقصر')) city = 'Luxor';
//   else if (combined.includes('aswan') || combined.includes('أسوان')) city = 'Aswan';
//   else if (combined.includes('cairo') || combined.includes('القاهرة')) city = 'Cairo';
//   else if (combined.includes('hurghada') || combined.includes('الغردقة')) city = 'Hurghada';
//   else if (combined.includes('sharm') || combined.includes('شرم')) city = 'Sharm El Sheikh';
//   else if (combined.includes('alex') || combined.includes('إسكندرية')) city = 'Alexandria';
//   else city = conversationCities[0] ?? 'Cairo';

//   try {
//     const raw = await fetchHotelsByCity(city, 3);
//     return raw.map((h, i) => mapApiHotel(h, i, locale));
//   } catch { return []; }
// }

// function shouldShowHotels(_u: string, _a: string, step: string) {
//   return step === 'hotel_selection' || step === 'preferences';
// }

// function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
//   let timer: ReturnType<typeof setTimeout>;
//   return ((...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }) as T;
// }

// // ─── Parse dates from text ────────────────────────────────────────────────────
// function parseDatesFromText(text: string): { checkIn: string; checkOut: string } | null {
//   // Try to extract ISO-like or natural dates
//   // e.g. "Oct 12 to Oct 20, 2024" → "2024-10-12" / "2024-10-20"
//   const months: Record<string, string> = {
//     jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
//     jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
//   };
//   const pattern = /(\w+)\s+(\d{1,2}).*?(\w+)\s+(\d{1,2}),?\s*(\d{4})?/i;
//   const match = text.match(pattern);
//   if (match) {
//     const year = match[5] ?? new Date().getFullYear().toString();
//     const m1 = months[match[1].toLowerCase().slice(0, 3)];
//     const m2 = months[match[3].toLowerCase().slice(0, 3)];
//     if (m1 && m2) {
//       return {
//         checkIn:  `${year}-${m1}-${match[2].padStart(2, '0')}`,
//         checkOut: `${year}-${m2}-${match[4].padStart(2, '0')}`,
//       };
//     }
//   }
//   return null;
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// export default function AITripPlannerPage() {
//   const router = useRouter();
//   const locale = useLocale() as 'en' | 'ar';
//   const t = dict[locale] ?? dict.en;
//   const isRtl = locale === 'ar';

//   // ── auth ──
//   const [checkingAuth, setCheckingAuth] = useState(true);

//   // ── chat state ──
//   const [sessionId,           setSessionId]           = useState<string | null>(null);
//   const [currentStep,         setCurrentStep]         = useState('destination');
//   const [messages,            setMessages]            = useState<Message[]>([]);
//   const [inputText,           setInputText]           = useState('');
//   const [isLoading,           setIsLoading]           = useState(false);
//   const [isHotelsLoading,     setIsHotelsLoading]     = useState(false);
//   const [error,               setError]               = useState<string | null>(null);
//   const [quotaExceeded,       setQuotaExceeded]       = useState(false);
//   const [conversationCities,  setConversationCities]  = useState<string[]>([]);
//   const [travelDates,         setTravelDates]         = useState<string | null>(null);

//   // ── hotel selection ──
//   const [selectedPrimaryHotel,   setSelectedPrimaryHotel]   = useState<HotelOption | null>(null);
//   const [selectedSecondaryHotel, setSelectedSecondaryHotel] = useState<HotelOption | null>(null);

//   // ── parsed dates for booking API ──
//   const [parsedCheckIn,  setParsedCheckIn]  = useState<string | null>(null);
//   const [parsedCheckOut, setParsedCheckOut] = useState<string | null>(null);

//   // ── booking + payment state ──
//   const [bookingStep,    setBookingStep]    = useState<'idle' | 'creating' | 'paying' | 'done'>('idle');
//   const [bookingError,   setBookingError]   = useState<string | null>(null);
//   const [bookingId,      setBookingId]      = useState<string | null>(null);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   // ── new trip confirmation ──
//   const [showNewTripConfirm, setShowNewTripConfirm] = useState(false);

//   const chatEndRef = useRef<HTMLDivElement>(null);

//   // ── auth check ──
//   useEffect(() => {
//     const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
//     if (!tokenMatch) router.push('/login');
//     else setCheckingAuth(false);
//   }, [router]);

//   // ── restore session ──
//   useEffect(() => {
//     if (checkingAuth) return;
//     const savedSession  = localStorage.getItem('rahal_planner_session_id');
//     const savedMessages = localStorage.getItem('rahal_planner_messages');
//     if (savedSession && savedMessages) {
//       setSessionId(savedSession);
//       try {
//         const parsed = JSON.parse(savedMessages).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
//         setMessages(parsed);
//         if (parsed.length > 0 && parsed[parsed.length - 1].step) {
//           setCurrentStep(parsed[parsed.length - 1].step);
//         }
//       } catch {
//         localStorage.removeItem('rahal_planner_session_id');
//         localStorage.removeItem('rahal_planner_messages');
//         startFreshConversation();
//       }
//     } else {
//       startFreshConversation();
//     }
//   }, [checkingAuth]);

//   // ── debounced localStorage write ──
//   const saveToStorage = useCallback(
//     debounce((msgs: Message[], sid: string | null) => {
//       if (sid) localStorage.setItem('rahal_planner_session_id', sid);
//       if (msgs.length > 0) localStorage.setItem('rahal_planner_messages', JSON.stringify(msgs));
//     }, 500), []
//   );

//   useEffect(() => { saveToStorage(messages, sessionId); }, [messages, sessionId, saveToStorage]);
//   useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

//   // ── city extraction ──
//   const extractCities = useCallback((text: string) => {
//     const cityMap: Record<string, string> = {
//       cairo: 'Cairo', 'القاهرة': 'Cairo', luxor: 'Luxor', 'الأقصر': 'Luxor',
//       aswan: 'Aswan', 'أسوان': 'Aswan', hurghada: 'Hurghada', 'الغردقة': 'Hurghada',
//       'marsa alam': 'Marsa Alam', 'مرسى علم': 'Marsa Alam',
//       sharm: 'Sharm El Sheikh', 'شرم': 'Sharm El Sheikh',
//       alexandria: 'Alexandria', 'إسكندرية': 'Alexandria',
//     };
//     const found: string[] = [];
//     const lower = text.toLowerCase();
//     for (const [key, city] of Object.entries(cityMap)) {
//       if (lower.includes(key) && !found.includes(city)) found.push(city);
//     }
//     if (found.length > 0) {
//       setConversationCities((prev) => {
//         const merged = [...prev];
//         for (const c of found) if (!merged.includes(c)) merged.push(c);
//         return merged;
//       });
//     }
//   }, []);

//   // ── date extraction ──
//   const extractDates = useCallback((text: string) => {
//     const patterns = [
//       /(?:from\s+)?(\w+\s+\d{1,2})\s*(?:to|–|—|-)\s*(\w+\s+\d{1,2}(?:,?\s*\d{4})?)/i,
//       /(\d{1,2}[\/\-]\d{1,2})\s*(?:to|–|—|-)\s*(\d{1,2}[\/\-]\d{1,2})/i,
//     ];
//     for (const pattern of patterns) {
//       const match = text.match(pattern);
//       if (match) {
//         setTravelDates(`${match[1]} — ${match[2]}`);
//         // also parse for booking API
//         const parsed = parseDatesFromText(text);
//         if (parsed) {
//           setParsedCheckIn(parsed.checkIn);
//           setParsedCheckOut(parsed.checkOut);
//         }
//         return;
//       }
//     }
//   }, []);

//   // ── fresh conversation ──
//   const startFreshConversation = useCallback(() => {
//     setSessionId(null);
//     setCurrentStep('destination');
//     setSelectedPrimaryHotel(null);
//     setSelectedSecondaryHotel(null);
//     setConversationCities([]);
//     setTravelDates(null);
//     setParsedCheckIn(null);
//     setParsedCheckOut(null);
//     setBookingStep('idle');
//     setBookingError(null);
//     setBookingId(null);
//     setShowSuccessModal(false);
//     setError(null);
//     setQuotaExceeded(false);
//     setInputText('');
//     const welcomeMsg: Message = {
//       id: 'welcome-msg', role: 'assistant', timestamp: new Date(), step: 'destination',
//       content: locale === 'ar'
//         ? 'أهلاً بك! 🇪🇬 أنا مساعد رحّال الذكي. دعنا نصمم مغامرتك في مصر. ما هي وجهتك الأولى؟'
//         : "Ahlan! 🇪🇬 I'm your Rahal AI Travel Assistant. Let's design your Egypt trip. Which city first? (Cairo, Luxor, Aswan, Marsa Alam?)",
//     };
//     setMessages([welcomeMsg]);
//     localStorage.removeItem('rahal_planner_session_id');
//     localStorage.removeItem('rahal_planner_messages');
//   }, [locale]);

//   // ── new trip button handler (with confirmation) ──
//   const handleNewTripClick = useCallback(() => {
//     // Only ask for confirmation if there's an actual conversation in progress
//     if (messages.length > 1 || selectedPrimaryHotel || selectedSecondaryHotel) {
//       setShowNewTripConfirm(true);
//     } else {
//       startFreshConversation();
//     }
//   }, [messages.length, selectedPrimaryHotel, selectedSecondaryHotel, startFreshConversation]);

//   const confirmNewTrip = useCallback(() => {
//     setShowNewTripConfirm(false);
//     startFreshConversation();
//   }, [startFreshConversation]);

//   // ── hotel auto-select ──
//   const detectAndSelectHotel = useCallback((text: string, hotelCards: HotelOption[]) => {
//     const lower = text.toLowerCase();
//     for (const hotel of hotelCards) {
//       const nameWords = hotel.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
//       if (nameWords.some((w) => lower.includes(w))) {
//         const isSecondLeg = ['luxor', 'aswan', 'الأقصر', 'أسوان'].some((k) => hotel.city.toLowerCase().includes(k));
//         if (isSecondLeg) setSelectedSecondaryHotel(hotel);
//         else setSelectedPrimaryHotel(hotel);
//         return;
//       }
//     }
//   }, []);

//   // ── send message ──
//   const handleSendMessage = useCallback(async (textToSend: string) => {
//     if (!textToSend.trim() || isLoading) return;
//     setError(null);
//     setBookingError(null);
//     extractCities(textToSend);
//     extractDates(textToSend);

//     const userMsg: Message = { id: String(Date.now()), role: 'user', content: textToSend, timestamp: new Date() };
//     setMessages((prev) => [...prev, userMsg]);
//     setInputText('');
//     setIsLoading(true);

//     const hotelsLikelyNeeded = shouldShowHotels(textToSend, '', currentStep);
//     if (hotelsLikelyNeeded) setIsHotelsLoading(true);

//     try {
//       const [response, earlyHotelCards] = await Promise.all([
//         aiApi.bookingConversation(textToSend, sessionId),
//         hotelsLikelyNeeded
//           ? resolveHotelsForContext(textToSend, '', conversationCities, locale).catch(() => [] as HotelOption[])
//           : Promise.resolve(undefined as HotelOption[] | undefined),
//       ]);

//       if (response?.status !== 'success') throw new Error('Invalid server response');
//       const { sessionId: nextSessionId, step: nextStep, aiResponse } = response.data;

//       setSessionId(nextSessionId);
//       setCurrentStep(nextStep);
//       extractCities(aiResponse);
//       extractDates(aiResponse);

//       let hotelCards = earlyHotelCards;
//       if (!hotelCards && shouldShowHotels(textToSend, aiResponse, nextStep)) {
//         setIsHotelsLoading(true);
//         try {
//           hotelCards = await resolveHotelsForContext(textToSend, aiResponse, conversationCities, locale);
//         } finally { setIsHotelsLoading(false); }
//       } else { setIsHotelsLoading(false); }

//       if (hotelCards && hotelCards.length > 0) detectAndSelectHotel(textToSend, hotelCards);

//       setMessages((prev) => [...prev, {
//         id: String(Date.now() + 1), role: 'assistant', content: aiResponse,
//         step: nextStep, timestamp: new Date(),
//         hotels: hotelCards?.length ? hotelCards : undefined,
//       }]);

//     } catch (err: any) {
//       setIsHotelsLoading(false);
//       const httpStatus: number = err.statusCode ?? err.status ?? err.code ?? 0;
//       const errMsg: string = (err.message ?? '').toLowerCase();

//       if (httpStatus === 401 || errMsg.includes('unauthorized')) { router.push('/login'); return; }
//       if (httpStatus === 429 || errMsg.includes('quota') || errMsg.includes('token limit') || errMsg.includes('limit reached')) {
//         setQuotaExceeded(true); return;
//       }
//       if (sessionId) {
//         setSessionId(null); setCurrentStep('destination');
//         setConversationCities([]);
//         localStorage.removeItem('rahal_planner_session_id');
//         localStorage.removeItem('rahal_planner_messages');
//         setMessages((prev) => [...prev, {
//           id: String(Date.now() + 2), role: 'assistant',
//           content: t.sessionExpired, timestamp: new Date(), step: 'destination',
//         }]);
//       } else {
//         setError(locale === 'ar' ? 'عذراً، واجهنا مشكلة. يرجى المحاولة مرة أخرى.' : 'Could not connect to Rahal. Please try again.');
//       }
//     } finally { setIsLoading(false); }
//   }, [isLoading, sessionId, locale, currentStep, conversationCities, extractCities, extractDates, detectAndSelectHotel, t, router]);

//   // ─── CONFIRM & PAY — real booking + payment ────────────────────────────────
//   const handleConfirmAndPay = useCallback(async () => {
//     if (!selectedPrimaryHotel) {
//       setBookingError(t.selectHotelFirst);
//       return;
//     }
//     setBookingError(null);
//     setBookingStep('creating');

//     try {
//       // ── Step 1: Create booking ──────────────────────────────────────────
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       let checkInDate  = parsedCheckIn  ? new Date(parsedCheckIn)  : null;
//       let checkOutDate = parsedCheckOut ? new Date(parsedCheckOut) : null;

//       if (!checkInDate || checkInDate < today) {
//         checkInDate = new Date(Date.now() + 7 * 86400000);
//       }
//       if (!checkOutDate || checkOutDate <= checkInDate) {
//         checkOutDate = new Date(checkInDate.getTime() + 4 * 86400000);
//       }

//       const checkIn  = checkInDate.toISOString().split('T')[0];
//       const checkOut = checkOutDate.toISOString().split('T')[0];

//       const bookingRes = await bookingsApi.createBooking({
//         hotel:   selectedPrimaryHotel.id,
//         checkIn,
//         checkOut,
//         guests:  1,   // TODO: wire up travelers count if available
//         rooms:   1,
//       });

//       if ((bookingRes as any).status !== 'success') throw new Error('Booking creation failed');
//       const createdBooking = (bookingRes as any).data as { _id?: string; id?: string };
//       const createdId = createdBooking._id ?? createdBooking.id;
//       if (!createdId) throw new Error('No booking ID returned');
//       setBookingId(createdId);

//       // ── Step 2: Checkout / payment redirect ────────────────────────────
//       setBookingStep('paying');
//       const payRes = await paymentsApi.bookingCheckout(createdId);
//       if ((payRes as any).status !== 'success') throw new Error('Payment session failed');
//       const { url } = (payRes as any).data as { url: string };

//       if (!url) throw new Error('No payment URL returned');

//       // Show brief success modal then redirect
//       setBookingStep('done');
//       setShowSuccessModal(true);
//       setTimeout(() => { window.location.href = url; }, 1500);

//     } catch (err: any) {
//       setBookingStep('idle');
//       const isPaymentErr = bookingId !== null; // booking was created but payment failed
//       setBookingError(isPaymentErr ? t.paymentError : t.bookingError);
//       console.error('Booking/payment error:', err);
//     }
//   }, [selectedPrimaryHotel, parsedCheckIn, parsedCheckOut, bookingId, t]);

//   // ── hotel card click ──
//   const handleSelectHotelCard = useCallback((hotel: HotelOption) => {
//     if (currentStep !== 'hotel_selection' && currentStep !== 'preferences') return;
//     const isSecondLeg = ['luxor', 'aswan', 'الأقصر', 'أسوان'].some((k) => hotel.city.toLowerCase().includes(k));
//     if (isSecondLeg) setSelectedSecondaryHotel(hotel);
//     else setSelectedPrimaryHotel(hotel);
//     const msg = locale === 'ar' ? `أريد حجز فندق ${hotel.name}` : `I want to book the hotel ${hotel.name}`;
//     handleSendMessage(msg);
//   }, [currentStep, locale, handleSendMessage]);

//   // ── step wizard ──
//   const steps = [
//     { id: 'destination', label: t.steps.destination, icon: MapPin },
//     { id: 'dates',       label: t.steps.dates,       icon: Calendar },
//     { id: 'budget',      label: t.steps.budget,      icon: DollarSign },
//     { id: 'hotels',      label: t.steps.hotels,      icon: Building2 },
//     { id: 'checkout',    label: t.steps.checkout,    icon: Check },
//   ];

//   const getStepIndex = (s: string) => {
//     const map: Record<string, number> = {
//       destination: 0, dates: 1, budget: 2,
//       preferences: 3, hotel_selection: 3,
//       guest_info: 4, payment: 4, complete: 4,
//     };
//     return map[s] ?? 0;
//   };

//   const currentStepIndex = getStepIndex(currentStep);
//   const isBookingInProgress = bookingStep === 'creating' || bookingStep === 'paying';

//   // ── pricing ──
//   const primaryDays   = 3;
//   const secondaryDays = 4;
//   const primaryBase   = (selectedPrimaryHotel?.pricePerNight   ?? 680)  * primaryDays;
//   const secondaryBase = (selectedSecondaryHotel?.pricePerNight ?? 352.5) * secondaryDays;
//   const currentTotal  = primaryBase + secondaryBase;
//   const optimizedTotal = Math.round(currentTotal * 0.83768);

//   if (checkingAuth) {
//     return (
//       <div className="flex flex-col min-h-screen items-center justify-center bg-bg text-ink1">
//         <Loader2 className="h-10 w-10 animate-spin text-brand mb-4" />
//         <span className="font-display font-medium text-lg">Consulting the Stars...</span>
//       </div>
//     );
//   }

//   return (
//     <main
//       className={cn('flex-1 w-full bg-bg text-ink1 pt-24 pb-16 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-8', isRtl ? 'font-arabic' : 'font-body')}
//       style={{ direction: isRtl ? 'rtl' : 'ltr' }}
//     >
//       {/* ── Stepper ── */}
//       <section className="w-full card-glass p-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-accent/5 to-transparent pointer-events-none" />
//         {steps.map((step, idx) => {
//           const isCompleted = idx < currentStepIndex || bookingStep === 'done';
//           const isActive    = idx === currentStepIndex && bookingStep !== 'done';
//           const StepIcon    = step.icon;
//           return (
//             <React.Fragment key={step.id}>
//               <div className="flex flex-col items-center gap-2 z-10 shrink-0 select-none">
//                 <div className={cn(
//                   'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold',
//                   isCompleted && 'bg-brand border-brand text-bg shadow-brand-glow shadow-sm',
//                   isActive    && 'bg-surface2 border-brand text-brand shadow-brand-glow glow-pulse',
//                   !isCompleted && !isActive && 'bg-surface1 border-border text-ink3'
//                 )}>
//                   {isCompleted ? <Check size={20} className="stroke-[3px]" />
//                     : isActive ? <StepIcon size={20} className="animate-pulse" />
//                     : <span>{idx + 1}</span>}
//                 </div>
//                 <span className={cn(
//                   'text-xs md:text-sm font-semibold tracking-wide',
//                   isCompleted && 'text-brand', isActive && 'text-ink1 font-bold',
//                   !isCompleted && !isActive && 'text-ink3'
//                 )}>{step.label}</span>
//               </div>
//               {idx < steps.length - 1 && (
//                 <div className={cn(
//                   'hidden md:block h-[3px] flex-1 mx-2 rounded-full transition-all duration-500',
//                   idx < currentStepIndex || bookingStep === 'done' ? 'bg-brand shadow-brand-glow' : 'bg-border'
//                 )} />
//               )}
//             </React.Fragment>
//           );
//         })}
//       </section>

//       {/* ── Two-column layout ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

//         {/* Left: Chat */}
//         <section className="lg:col-span-8 flex flex-col card bg-surface1 p-0 border border-border overflow-hidden h-[750px] shadow-card hover:shadow-card-hover">
//           {/* header */}
//           <div className="p-4 border-b border-border bg-surface2/50 flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
//               <Sparkles className="w-5 h-5 text-brand" />
//             </div>
//             <div className="flex-1">
//               <h2 className="font-display text-sm md:text-base font-bold text-ink1 flex items-center gap-1.5">
//                 {t.plannerTitle}
//                 <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
//               </h2>
//               <p className="text-xs text-ink2">{t.plannerSubtitle}</p>
//             </div>
//             <button
//               type="button"
//               onClick={handleNewTripClick}
//               title={t.newTrip}
//               className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-ink2 hover:text-brand border border-border hover:border-brand/40 bg-surface1 hover:bg-brand/5 rounded-lg px-3 py-2 transition-colors cursor-pointer"
//             >
//               <RefreshCw size={14} />
//               <span className="hidden sm:inline">{t.newTrip}</span>
//             </button>
//           </div>

//           {/* chat feed */}
//           <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 scrollbar-thin" aria-live="polite">
//             {messages.map((msg) => {
//               const isUser = msg.role === 'user';
//               return (
//                 <div key={msg.id} className={cn('flex flex-col max-w-[85%] animate-fade-up', isUser ? 'self-end items-end' : 'self-start items-start')}>
//                   <div className={cn('p-4 text-sm md:text-base leading-relaxed break-words shadow-sm', isUser ? 'chat-user font-medium' : 'chat-ai border-l-3 border-accent')}>
//                     <p className="whitespace-pre-wrap">{msg.content}</p>
//                   </div>
//                   <span className="text-[10px] text-ink3 mt-1.5 px-1.5 flex items-center gap-1">
//                     {isUser && <Check size={10} className="text-brand shrink-0" />}
//                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </span>

//                   {/* Hotel cards */}
//                   {!isUser && msg.hotels && msg.hotels.length > 0 && (
//                     <div className="w-full mt-4 overflow-x-auto pb-2 flex gap-4 select-none scrollbar-thin max-w-full">
//                       {msg.hotels.map((hotel) => {
//                         const isSelected = selectedPrimaryHotel?.id === hotel.id || selectedSecondaryHotel?.id === hotel.id;
//                         return (
//                           <div key={hotel.id} onClick={() => handleSelectHotelCard(hotel)}
//                             className={cn(
//                               'flex-none w-64 md:w-72 bg-surface1 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:translate-y-[-4px]',
//                               isSelected ? 'border-brand ring-2 ring-brand-glow shadow-brand-glow' : 'border-border hover:border-border-glow hover:shadow-md'
//                             )}>
//                             <div className="h-32 w-full relative bg-surface2">
//                               <img src={hotel.image} alt={hotel.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
//                               <div className="absolute inset-0 image-overlay pointer-events-none" />
//                               {hotel.badge && (
//                                 <span className={cn(
//                                   'absolute top-2.5 right-2.5 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm z-10',
//                                   hotel.badge === 'top-pick'   && 'bg-brand text-bg',
//                                   hotel.badge === 'selected'   && 'bg-accent text-bg',
//                                   hotel.badge === 'best-value' && 'bg-success text-bg'
//                                 )}>
//                                   {hotel.badge === 'top-pick' ? (locale === 'ar' ? 'أفضل خيار' : 'TOP PICK')
//                                     : hotel.badge === 'selected' ? (locale === 'ar' ? 'مختار' : 'SELECTED')
//                                     : (locale === 'ar' ? 'أفضل قيمة' : 'BEST VALUE')}
//                                 </span>
//                               )}
//                             </div>
//                             <div className="p-4 flex flex-col gap-2">
//                               <div className="flex justify-between items-start gap-1">
//                                 <h3 className="text-xs md:text-sm font-bold text-ink1 line-clamp-1">{hotel.name}</h3>
//                                 <span className="text-xs md:text-sm font-extrabold text-brand shrink-0">
//                                   ${hotel.pricePerNight}<span className="text-[10px] font-normal text-ink3">/{locale === 'ar' ? 'ل' : 'nt'}</span>
//                                 </span>
//                               </div>
//                               <p className="text-[10px] md:text-xs text-ink2 flex items-center gap-1">
//                                 <MapPin size={10} className="text-ink3" />{hotel.location}
//                               </p>
//                               <span className="badge-base badge-plan-free bg-accent-glow text-accent py-1 font-semibold text-[10px] border border-accent/15">
//                                 {hotel.insight}
//                               </span>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}

//             {isLoading && (
//               <div className="self-start flex flex-col max-w-[80%] animate-fade-in">
//                 <div className="chat-ai p-4 flex items-center gap-2.5">
//                   <span className="text-xs text-ink2">{t.aiTyping}</span>
//                   <div className="flex gap-1 items-center">
//                     <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
//                     <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
//                     <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {isHotelsLoading && (
//               <div className="self-start flex items-center gap-2 text-xs text-ink2 animate-fade-in px-2">
//                 <Loader2 size={14} className="animate-spin text-brand" />
//                 <span>{t.loadingHotels}</span>
//               </div>
//             )}

//             {quotaExceeded && (
//               <div className="self-center w-full max-w-[92%] rounded-2xl overflow-hidden border border-brand/30 shadow-brand-glow animate-fade-up">
//                 <div className="bg-brand/10 px-5 py-4 flex flex-col gap-2">
//                   <div className="flex items-center gap-2">
//                     <Sparkles size={16} className="text-brand shrink-0" />
//                     <span className="text-sm font-bold text-ink1">{t.quotaTitle}</span>
//                   </div>
//                   <p className="text-xs text-ink2 leading-relaxed">{t.quotaDesc}</p>
//                   <div className="flex items-center justify-between gap-3 mt-1">
//                     <span className="text-[10px] text-ink3">{t.quotaReset}</span>
//                     <a href="/pricing" className="btn-primary text-xs px-4 py-1.5 rounded-lg font-semibold no-underline">{t.quotaUpgrade}</a>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div className="self-center bg-error/10 border border-error/25 text-error rounded-xl p-3 max-w-[90%] text-xs text-center flex items-center gap-2">
//                 <Shield size={14} className="shrink-0" /><span>{error}</span>
//               </div>
//             )}

//             <div ref={chatEndRef} />
//           </div>

//           {/* Quick replies */}
//           {!isLoading && messages.length > 0 && !quotaExceeded && (
//             <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-border bg-surface1 z-10">
//               {currentStep === 'destination' && (
//                 <>
//                   <button onClick={() => handleSendMessage(locale === 'ar' ? 'أريد زيارة القاهرة والأقصر' : 'I want to visit Cairo and Luxor')}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {locale === 'ar' ? 'رحلة القاهرة والأقصر' : 'Cairo & Luxor retreat'}
//                   </button>
//                   <button onClick={() => handleSendMessage(locale === 'ar' ? 'رحلة بحرية في مرسى علم' : 'A trip to Marsa Alam beach resort')}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {locale === 'ar' ? 'منتجع مرسى علم' : 'Marsa Alam resort'}
//                   </button>
//                 </>
//               )}
//               {currentStep === 'dates' && (
//                 <>
//                   <button onClick={() => handleSendMessage(locale === 'ar' ? 'من ١٢ أكتوبر إلى ٢٠ أكتوبر ٢٠٢٤' : 'From Oct 12 to Oct 20, 2024')}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {t.datesDefault}
//                   </button>
//                   <button onClick={() => handleSendMessage(t.bestTime)}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {t.bestTime}
//                   </button>
//                 </>
//               )}
//               {currentStep === 'budget' && (
//                 <>
//                   <button onClick={() => handleSendMessage(locale === 'ar' ? 'ميزانية تراثية فاخرة' : 'Luxury heritage budget')}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {t.budgetDefault}
//                   </button>
//                   <button onClick={() => handleSendMessage(locale === 'ar' ? 'ميزانية متوسطة' : 'Mid-range budget ($50 - $150)')}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {locale === 'ar' ? 'ميزانية متوسطة' : 'Mid-range budget'}
//                   </button>
//                 </>
//               )}
//               {(currentStep === 'hotel_selection' || currentStep === 'preferences') && (
//                 <>
//                   <button onClick={() => handleSendMessage(locale === 'ar' ? 'اقترح فنادق مطلة على النيل بالقاهرة' : 'Suggest Cairo hotels with Nile views')}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {t.suggestCairo}
//                   </button>
//                   <button onClick={() => handleSendMessage(locale === 'ar' ? 'اقترح فنادق في الأقصر' : 'Suggest Luxor hotels')}
//                     className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
//                     {t.suggestLuxor}
//                   </button>
//                 </>
//               )}
//             </div>
//           )}

//           {/* Input bar */}
//           <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
//             className="p-4 border-t border-border bg-surface2/30 flex items-center gap-3">
//             <div className="relative flex-1 flex items-center">
//               <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
//                 placeholder={t.chatPlaceholder}
//                 disabled={isLoading || bookingStep === 'done' || quotaExceeded}
//                 className="input w-full bg-surface1 pr-12 focus:ring-accent" />
//               <button type="button" aria-label="Voice input"
//                 className="absolute right-3.5 text-ink3 hover:text-brand cursor-pointer p-1 rounded-full transition-colors border-none bg-transparent">
//                 <Mic size={18} />
//               </button>
//             </div>
//             <button type="submit"
//               disabled={!inputText.trim() || isLoading || bookingStep === 'done' || quotaExceeded}
//               className={cn(
//                 'w-12 h-12 rounded-lg bg-brand text-bg flex items-center justify-center transition-all cursor-pointer border-none',
//                 (!inputText.trim() || isLoading || bookingStep === 'done' || quotaExceeded) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-brand-glow'
//               )}>
//               <Send size={18} className={cn(isRtl && 'rotate-180')} />
//             </button>
//           </form>
//         </section>

//         {/* Right: Booking Summary */}
//         <section className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
//           <div className="card bg-surface1 border border-border shadow-card hover:shadow-card-hover p-6 flex flex-col gap-6">
//             <h2 className="font-display text-base md:text-lg font-bold border-b border-border pb-3 flex items-center justify-between">
//               {t.bookingSummary}
//               <Building2 className="w-5 h-5 text-brand" />
//             </h2>

//             <div className="flex flex-col gap-4">
//               {/* Destination */}
//               <div className="flex gap-3">
//                 <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
//                   <MapPin size={18} className="text-brand" />
//                 </div>
//                 <div className="overflow-hidden">
//                   <span className="text-[10px] font-bold text-ink3 tracking-widest block">{t.destinationLabel}</span>
//                   <span className="text-sm font-semibold text-ink1 truncate block">
//                     {currentStepIndex > 0
//                       ? (conversationCities.length > 0 ? conversationCities.join(' & ') + ', Egypt' : t.cairoEgypt)
//                       : t.awaitingSelection}
//                   </span>
//                 </div>
//               </div>

//               {/* Dates */}
//               <div className="flex gap-3">
//                 <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
//                   <Calendar size={18} className="text-brand" />
//                 </div>
//                 <div className="overflow-hidden">
//                   <span className="text-[10px] font-bold text-ink3 tracking-widest block">{t.travelDatesLabel}</span>
//                   <span className="text-sm font-semibold text-ink1 truncate block">
//                     {currentStepIndex > 1 ? (travelDates ?? t.datesDefault) : t.awaitingSelection}
//                   </span>
//                 </div>
//               </div>

//               {/* Budget */}
//               <div className="flex gap-3">
//                 <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
//                   <DollarSign size={18} className="text-brand" />
//                 </div>
//                 <div className="overflow-hidden">
//                   <span className="text-[10px] font-bold text-ink3 tracking-widest block">{t.budgetLevelLabel}</span>
//                   <span className="text-sm font-semibold text-ink1 truncate block">
//                     {currentStepIndex > 2 ? t.budgetDefault : t.awaitingSelection}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Live itinerary */}
//             <div className="border-t border-border pt-4 flex flex-col gap-3">
//               <span className="text-xs font-bold text-ink3 tracking-wider uppercase block">{t.liveItinerary}</span>
//               <div className="flex justify-between items-start gap-2">
//                 <div className="pl-4 border-l-2 border-brand/40 flex flex-col">
//                   <span className="text-xs font-bold text-ink1">
//                     Oct 12-15 ({conversationCities[0] ?? (locale === 'ar' ? 'القاهرة' : 'Cairo')})
//                   </span>
//                   <span className="text-[11px] text-ink2 truncate">
//                     {selectedPrimaryHotel ? selectedPrimaryHotel.name : t.awaitingSelection}
//                   </span>
//                 </div>
//                 {selectedPrimaryHotel && (
//                   <span className="text-xs font-extrabold text-ink1 shrink-0">
//                     ${selectedPrimaryHotel.pricePerNight * primaryDays}
//                   </span>
//                 )}
//               </div>
//               <div className="flex justify-between items-start gap-2 mt-2">
//                 <div className="pl-4 border-l-2 border-border/60 flex flex-col">
//                   <span className="text-xs font-bold text-ink1">
//                     Oct 16-20 ({conversationCities[1] ?? (locale === 'ar' ? 'الأقصر' : 'Luxor')})
//                   </span>
//                   <span className="text-[11px] text-ink3 italic">
//                     {selectedSecondaryHotel ? selectedSecondaryHotel.name : t.awaitingSelection}
//                   </span>
//                 </div>
//                 {selectedSecondaryHotel && (
//                   <span className="text-xs font-extrabold text-ink1 shrink-0">
//                     ${selectedSecondaryHotel.pricePerNight * secondaryDays}
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Pricing */}
//             <div className="border-t border-border pt-4 flex flex-col gap-2">
//               <div className="flex justify-between items-center text-xs text-ink3">
//                 <span>{t.originalPrice}</span>
//                 <span className="line-through">${currentTotal}</span>
//               </div>
//               <div className="flex justify-between items-center text-xs text-accent">
//                 <span className="flex items-center gap-1"><Percent size={12} />{t.rahalDiscount}</span>
//                 <span>-${currentTotal - optimizedTotal}</span>
//               </div>
//               <div className="flex justify-between items-baseline mt-2">
//                 <span className="text-sm font-bold text-ink1">{t.estTotal}</span>
//                 <span className="font-display text-xl md:text-2xl font-extrabold text-brand">${optimizedTotal}*</span>
//               </div>
//               <span className="text-[10px] text-ink3 leading-normal border-t border-border/5 pt-2 text-center block">
//                 {t.perksNotice}
//               </span>
//             </div>

//             {/* Booking error */}
//             {bookingError && (
//               <div className="bg-error/10 border border-error/25 text-error rounded-xl p-3 text-xs flex items-start gap-2">
//                 <AlertCircle size={14} className="shrink-0 mt-0.5" />
//                 <span>{bookingError}</span>
//               </div>
//             )}

//             {/* Confirm & Pay button */}
//             <button
//               onClick={handleConfirmAndPay}
//               disabled={currentStepIndex < 3 || isBookingInProgress || bookingStep === 'done'}
//               className={cn(
//                 'btn-primary w-full py-3.5 flex items-center justify-center gap-2',
//                 (currentStepIndex < 3 || isBookingInProgress || bookingStep === 'done') && 'opacity-40 cursor-not-allowed'
//               )}
//             >
//               {isBookingInProgress ? (
//                 <>
//                   <Loader2 size={18} className="animate-spin" />
//                   <span className="font-semibold text-sm md:text-base">
//                     {bookingStep === 'creating' ? t.processingBooking : t.processingPayment}
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span className="font-semibold text-sm md:text-base">
//                     {currentStepIndex >= 3 ? t.confirmPayActive : t.confirmPay}
//                   </span>
//                   <ArrowRight size={18} className={cn(isRtl && 'rotate-180', 'shrink-0')} />
//                 </>
//               )}
//             </button>
//           </div>
//         </section>
//       </div>

//       {/* ── New trip confirmation modal ── */}
//       {showNewTripConfirm && (
//         <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
//           <div className="w-full max-w-sm card bg-surface1 border border-border shadow-2xl p-6 flex flex-col items-center text-center gap-4">
//             <div className="w-12 h-12 rounded-full bg-brand/10 border-2 border-brand flex items-center justify-center text-brand">
//               <RefreshCw size={22} />
//             </div>
//             <p className="text-sm text-ink1 leading-relaxed">{t.newTripConfirm}</p>
//             <div className="flex w-full gap-3 mt-2">
//               <button
//                 onClick={() => setShowNewTripConfirm(false)}
//                 className="btn-ghost flex-1 py-2.5 border border-border text-ink2 hover:text-ink1 font-medium text-sm"
//               >
//                 {locale === 'ar' ? 'إلغاء' : 'Cancel'}
//               </button>
//               <button
//                 onClick={confirmNewTrip}
//                 className="btn-primary flex-1 py-2.5 font-semibold text-sm"
//               >
//                 {t.newTrip}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Success modal ── */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
//           <div className="w-full max-w-md card bg-surface1 border border-border shadow-2xl p-6 md:p-8 flex flex-col items-center text-center">
//             <div className="w-16 h-16 rounded-full bg-brand/10 border-2 border-brand flex items-center justify-center text-brand mb-6 shadow-brand-glow glow-pulse">
//               <Sparkles size={32} />
//             </div>
//             <h2 className="font-display text-xl md:text-2xl font-extrabold text-ink1 mb-3">
//               {t.bookingSuccessTitle}
//             </h2>
//             <p className="text-sm text-ink2 leading-relaxed mb-4">{t.bookingSuccessDesc}</p>
//             {bookingId && (
//               <div className="w-full bg-surface2/60 border border-border rounded-xl p-4 mb-4">
//                 <div className="flex justify-between items-center text-xs">
//                   <span className="text-ink3 font-bold">{t.bookingId}</span>
//                   <span className="text-brand font-mono font-bold tracking-wider">{bookingId}</span>
//                 </div>
//               </div>
//             )}
//             <div className="flex items-center gap-2 text-xs text-ink2">
//               <Loader2 size={14} className="animate-spin text-brand" />
//               <span>{locale === 'ar' ? 'جاري التحويل...' : 'Redirecting to payment...'}</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Check, Calendar, MapPin, DollarSign, Send, Mic, ArrowRight,
  Loader2, Sparkles, Building2, Shield, Percent, AlertCircle, RefreshCw,
} from 'lucide-react';
import { aiApi } from '@/lib/api/ai';
import { bookingsApi } from '@/lib/api/bookings';
import { paymentsApi } from '@/lib/api/payments';
import { hotelsApi } from '@/lib/api/hotels';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  step?: string;
  timestamp: Date;
  hotels?: HotelOption[];
}

interface HotelOption {
  id: string;
  name: string;
  pricePerNight: number;
  location: string;
  image: string;
  badge: 'top-pick' | 'selected' | 'best-value' | null;
  insight: string;
  city: string;
}

interface ApiHotel {
  _id: string;
  name: { en: string; ar: string };
  city: string;
  averagePricePerNight: number;
  currency: string;
  stars: number;
  coverImage?: string;
  images?: string[];
  amenities?: string[];
}

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
    newTrip: 'New Trip',
    newTripConfirm: 'Start a new trip? Your current conversation will be cleared.',
    bookingSummaryTab: 'Summary',
    chatTab: 'Chat',
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
    newTrip: 'رحلة جديدة',
    newTripConfirm: 'بدء رحلة جديدة؟ سيتم مسح المحادثة الحالية.',
    bookingSummaryTab: 'الملخص',
    chatTab: 'المحادثة',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BADGE_ORDER: Array<HotelOption['badge']> = ['top-pick', 'selected', 'best-value'];

// Cities that are considered "second leg" ONLY when a primary hotel already exists
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

function parseDatesFromText(text: string): { checkIn: string; checkOut: string } | null {
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const pattern = /(\w+)\s+(\d{1,2}).*?(\w+)\s+(\d{1,2}),?\s*(\d{4})?/i;
  const match = text.match(pattern);
  if (match) {
    const year = match[5] ?? new Date().getFullYear().toString();
    const m1 = months[match[1].toLowerCase().slice(0, 3)];
    const m2 = months[match[3].toLowerCase().slice(0, 3)];
    if (m1 && m2) {
      return {
        checkIn:  `${year}-${m1}-${match[2].padStart(2, '0')}`,
        checkOut: `${year}-${m2}-${match[4].padStart(2, '0')}`,
      };
    }
  }
  return null;
}

function extractConfirmedHotelName(aiText: string): string | null {
  const patterns = [
  /[-•]\s*(?:hotel|الفندق)\s*[:\-]\s*(.+)/i,  // "- Hotel: Name"
  /(?:hotel|الفندق)\s*[:\-]\s*(.+)/i,
];
  for (const pattern of patterns) {
    const match = aiText.match(pattern);
    if (match) {
      return match[1].split(/\n|،|,/)[0].trim();
    }
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AITripPlannerPage() {
  const router = useRouter();
  const locale = useLocale() as 'en' | 'ar';
  const t = dict[locale] ?? dict.en;
  const isRtl = locale === 'ar';

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sessionId,           setSessionId]           = useState<string | null>(null);
  const [currentStep,         setCurrentStep]         = useState('destination');
  const [messages,            setMessages]            = useState<Message[]>([]);
  const [inputText,           setInputText]           = useState('');
  const [isLoading,           setIsLoading]           = useState(false);
  const [isHotelsLoading,     setIsHotelsLoading]     = useState(false);
  const [error,               setError]               = useState<string | null>(null);
  const [quotaExceeded,       setQuotaExceeded]       = useState(false);
  const [conversationCities,  setConversationCities]  = useState<string[]>([]);
  const [travelDates,         setTravelDates]         = useState<string | null>(null);

  const [selectedPrimaryHotel,   setSelectedPrimaryHotel]   = useState<HotelOption | null>(null);
  const [selectedSecondaryHotel, setSelectedSecondaryHotel] = useState<HotelOption | null>(null);
  const [allSeenHotels,          setAllSeenHotels]          = useState<HotelOption[]>([]);

  // ── CRITICAL: refs so callbacks always read current state ──
  const allSeenHotelsRef         = useRef<HotelOption[]>([]);
  const selectedPrimaryHotelRef  = useRef<HotelOption | null>(null);
  const selectedSecondaryHotelRef = useRef<HotelOption | null>(null);

  useEffect(() => { allSeenHotelsRef.current = allSeenHotels; }, [allSeenHotels]);
  useEffect(() => { selectedPrimaryHotelRef.current = selectedPrimaryHotel; }, [selectedPrimaryHotel]);
  useEffect(() => { selectedSecondaryHotelRef.current = selectedSecondaryHotel; }, [selectedSecondaryHotel]);

  const [parsedCheckIn,  setParsedCheckIn]  = useState<string | null>(null);
  const [parsedCheckOut, setParsedCheckOut] = useState<string | null>(null);

  const [bookingStep,    setBookingStep]    = useState<'idle' | 'creating' | 'paying' | 'done'>('idle');
  const [bookingError,   setBookingError]   = useState<string | null>(null);
  const [bookingId,      setBookingId]      = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNewTripConfirm, setShowNewTripConfirm] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'summary'>('chat');

  const chatEndRef    = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // ── auth check ──
  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    if (!tokenMatch) router.push('/login');
    else setCheckingAuth(false);
  }, [router]);

  // ── restore session ──
  useEffect(() => {
    if (checkingAuth) return;
    const savedSession  = localStorage.getItem('rahal_planner_session_id');
    const savedMessages = localStorage.getItem('rahal_planner_messages');
    if (savedSession && savedMessages) {
      setSessionId(savedSession);
      try {
        const parsed = JSON.parse(savedMessages).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        setMessages(parsed);
        if (parsed.length > 0 && parsed[parsed.length - 1].step) {
          setCurrentStep(parsed[parsed.length - 1].step);
        }
      } catch {
        localStorage.removeItem('rahal_planner_session_id');
        localStorage.removeItem('rahal_planner_messages');
        startFreshConversation();
      }
    } else {
      startFreshConversation();
    }
  }, [checkingAuth]);

  // ── debounced localStorage write ──
  const saveToStorage = useCallback(
    debounce((msgs: Message[], sid: string | null) => {
      if (sid) localStorage.setItem('rahal_planner_session_id', sid);
      if (msgs.length > 0) localStorage.setItem('rahal_planner_messages', JSON.stringify(msgs));
    }, 500), []
  );

  useEffect(() => { saveToStorage(messages, sessionId); }, [messages, sessionId, saveToStorage]);

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

  // ── city extraction ──
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

  // ── date extraction ──
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

  // ── fresh conversation ──
  const startFreshConversation = useCallback(() => {
    setSessionId(null);
    setCurrentStep('destination');
    setSelectedPrimaryHotel(null);
    setSelectedSecondaryHotel(null);
    setAllSeenHotels([]);
    setConversationCities([]);
    setTravelDates(null);
    setParsedCheckIn(null);
    setParsedCheckOut(null);
    setBookingStep('idle');
    setBookingError(null);
    setBookingId(null);
    setShowSuccessModal(false);
    setError(null);
    setQuotaExceeded(false);
    setInputText('');
    setMobileTab('chat');
    const welcomeMsg: Message = {
      id: 'welcome-msg', role: 'assistant', timestamp: new Date(), step: 'destination',
      content: locale === 'ar'
        ? 'أهلاً بك! 🇪🇬 أنا مساعد رحّال الذكي. دعنا نصمم مغامرتك في مصر. ما هي وجهتك الأولى؟'
        : "Ahlan! 🇪🇬 I'm your Rahal AI Travel Assistant. Let's design your Egypt trip. Which city first? (Cairo, Luxor, Aswan, Marsa Alam?)",
    };
    setMessages([welcomeMsg]);
    localStorage.removeItem('rahal_planner_session_id');
    localStorage.removeItem('rahal_planner_messages');
  }, [locale]);

  const handleNewTripClick = useCallback(() => {
    if (messages.length > 1 || selectedPrimaryHotel || selectedSecondaryHotel) {
      setShowNewTripConfirm(true);
    } else {
      startFreshConversation();
    }
  }, [messages.length, selectedPrimaryHotel, selectedSecondaryHotel, startFreshConversation]);

  const confirmNewTrip = useCallback(() => {
    setShowNewTripConfirm(false);
    startFreshConversation();
  }, [startFreshConversation]);

  // ── FIXED: assign hotel using refs to always read current state ──
  const assignHotel = useCallback((hotel: HotelOption) => {
    const primary   = selectedPrimaryHotelRef.current;
    const secondary = selectedSecondaryHotelRef.current;

    if (!primary) {
      // No primary yet → always assign as primary regardless of city
      setSelectedPrimaryHotel(hotel);
    } else if (isSecondLegCity(hotel.city) && !secondary) {
      // Primary exists + hotel is Luxor/Aswan + no secondary yet → assign as secondary
      setSelectedSecondaryHotel(hotel);
    } else if (primary.id !== hotel.id) {
      // Otherwise update primary (user changed their main hotel)
      setSelectedPrimaryHotel(hotel);
    }
  }, []);

  // ── hotel auto-select from user text ──
  const detectAndSelectHotel = useCallback((text: string, hotelCards: HotelOption[]) => {
    const lower = text.toLowerCase();
    for (const hotel of hotelCards) {
      const nameWords = hotel.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      if (nameWords.some((w) => lower.includes(w))) {
        assignHotel(hotel);
        return;
      }
    }
  }, [assignHotel]);

  // ── FIXED: hotel confirm from AI reply — uses refs, not stale closure ──
  const confirmHotelFromAiText = useCallback(async (aiText: string, knownHotels: HotelOption[]) => {
    console.log('🔥 confirmHotelFromAiText called');
    const confirmedName = extractConfirmedHotelName(aiText);
    console.log('confirmedName:', confirmedName);
    if (!confirmedName) return;

    const lowerConfirmed = confirmedName.toLowerCase();

    // Try to match against known hotel cards first
    for (const hotel of knownHotels) {
      const nameWords = hotel.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matches = hotel.name.toLowerCase() === lowerConfirmed
        || nameWords.some((w) => lowerConfirmed.includes(w));
      if (matches) {
        console.log('✅ matched hotel card:', hotel.name);
        assignHotel(hotel);
        return;
      }
    }

    // No card match — look up directly by name
    console.log('🔍 looking up hotel by name:', confirmedName);
   const apiHotel = await fetchHotelByName(confirmedName);
if (!apiHotel) {
  // Fallback: placeholder حتى لو مش لاقيناه في الـ API
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
    console.log('✅ found via API:', hotel.name);
    setAllSeenHotels((prev) => (prev.some((h) => h.id === hotel.id) ? prev : [...prev, hotel]));
    assignHotel(hotel);
  }, [locale, assignHotel]);

  // ── send message ──
  const handleSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    setError(null);
    setBookingError(null);
    extractCities(textToSend);
    extractDates(textToSend);

    const userMsg: Message = { id: String(Date.now()), role: 'user', content: textToSend, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    isNearBottomRef.current = true;

    const hotelsLikelyNeeded = shouldShowHotels(textToSend, '', currentStep);
    if (hotelsLikelyNeeded) setIsHotelsLoading(true);

    try {
      const [response, earlyHotelCards] = await Promise.all([
        aiApi.bookingConversation(textToSend, sessionId),
        hotelsLikelyNeeded
          ? resolveHotelsForContext(textToSend, '', conversationCities, locale).catch(() => [] as HotelOption[])
          : Promise.resolve(undefined as HotelOption[] | undefined),
      ]);

      if (response?.status !== 'success') throw new Error('Invalid server response');
      const { sessionId: nextSessionId, step: nextStep, aiResponse } = response.data;

      setSessionId(nextSessionId);
      setCurrentStep(nextStep);
      extractCities(aiResponse);
      extractDates(aiResponse);

      let hotelCards = earlyHotelCards;
      if (!hotelCards && shouldShowHotels(textToSend, aiResponse, nextStep)) {
        setIsHotelsLoading(true);
        try {
          hotelCards = await resolveHotelsForContext(textToSend, aiResponse, conversationCities, locale);
        } finally { setIsHotelsLoading(false); }
      } else { setIsHotelsLoading(false); }

      if (hotelCards && hotelCards.length > 0) {
        setAllSeenHotels((prev) => {
          const merged = [...prev];
          for (const h of hotelCards!) if (!merged.some((m) => m.id === h.id)) merged.push(h);
          return merged;
        });
        detectAndSelectHotel(textToSend, hotelCards);
      }

      // Use all known hotels (seen so far + newly fetched)
      const knownHotelsSoFar = hotelCards && hotelCards.length > 0
        ? [...allSeenHotelsRef.current, ...hotelCards]
        : allSeenHotelsRef.current;

      await confirmHotelFromAiText(aiResponse, knownHotelsSoFar);

      setMessages((prev) => [...prev, {
        id: String(Date.now() + 1), role: 'assistant', content: aiResponse,
        step: nextStep, timestamp: new Date(),
        hotels: hotelCards?.length ? hotelCards : undefined,
      }]);

    } catch (err: any) {
      setIsHotelsLoading(false);
      const httpStatus: number = err.statusCode ?? err.status ?? err.code ?? 0;
      const errMsg: string = (err.message ?? '').toLowerCase();

      if (httpStatus === 401 || errMsg.includes('unauthorized')) { router.push('/login'); return; }
      if (httpStatus === 429 || errMsg.includes('quota') || errMsg.includes('token limit') || errMsg.includes('limit reached')) {
        setQuotaExceeded(true); return;
      }
      if (sessionId) {
        setSessionId(null); setCurrentStep('destination');
        setConversationCities([]);
        localStorage.removeItem('rahal_planner_session_id');
        localStorage.removeItem('rahal_planner_messages');
        setMessages((prev) => [...prev, {
          id: String(Date.now() + 2), role: 'assistant',
          content: t.sessionExpired, timestamp: new Date(), step: 'destination',
        }]);
      } else {
        setError(locale === 'ar' ? 'عذراً، واجهنا مشكلة. يرجى المحاولة مرة أخرى.' : 'Could not connect to Rahal. Please try again.');
      }
    } finally { setIsLoading(false); }
  }, [isLoading, sessionId, locale, currentStep, conversationCities, extractCities, extractDates, detectAndSelectHotel, confirmHotelFromAiText, t, router]);

  // ─── CONFIRM & PAY ────────────────────────────────────────────────────────
 const handleConfirmAndPay = useCallback(async () => {
  let hotelToBook = selectedPrimaryHotel ?? selectedSecondaryHotel;
  if (!hotelToBook) {
    setBookingError(t.selectHotelFirst);
    return;
  }

  // لو الفندق placeholder (مش لاقيناه في الـ API قبل كده)، ابحث عنه دلوقتي
  if (hotelToBook.id.startsWith('pending-')) {
    const found = await fetchHotelByName(hotelToBook.name);
    if (!found) {
      setBookingError(t.bookingError);
      return;
    }
    hotelToBook = mapApiHotel(found, 0, locale);
  }

  setBookingError(null);
  setBookingStep('creating');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkInDate  = parsedCheckIn  ? new Date(parsedCheckIn)  : null;
    let checkOutDate = parsedCheckOut ? new Date(parsedCheckOut) : null;

    if (!checkInDate || checkInDate < today) {
      checkInDate = new Date(Date.now() + 7 * 86400000);
    }
    if (!checkOutDate || checkOutDate <= checkInDate) {
      checkOutDate = new Date(checkInDate.getTime() + 4 * 86400000);
    }

    const checkIn  = checkInDate.toISOString().split('T')[0];
    const checkOut = checkOutDate.toISOString().split('T')[0];

    const bookingRes = await bookingsApi.createBooking({
      hotel:   hotelToBook.id,
      checkIn,
      checkOut,
      guests:  1,
      rooms:   1,
    });

    if ((bookingRes as any).status !== 'success') throw new Error('Booking creation failed');
    const createdBooking = (bookingRes as any).data as { _id?: string; id?: string };
    const createdId = createdBooking._id ?? createdBooking.id;
    if (!createdId) throw new Error('No booking ID returned');
    setBookingId(createdId);

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
}, [selectedPrimaryHotel, selectedSecondaryHotel, parsedCheckIn, parsedCheckOut, bookingId, t, locale]);

  // ── hotel card click ──
  const handleSelectHotelCard = useCallback((hotel: HotelOption) => {
    if (currentStep !== 'hotel_selection' && currentStep !== 'preferences') return;
    assignHotel(hotel);
    const msg = locale === 'ar' ? `أريد حجز فندق ${hotel.name}` : `I want to book the hotel ${hotel.name}`;
    handleSendMessage(msg);
  }, [currentStep, locale, handleSendMessage, assignHotel]);

  // ── step wizard ──
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

  const currentStepIndex   = getStepIndex(currentStep);
  const isBookingInProgress = bookingStep === 'creating' || bookingStep === 'paying';

  // ── pricing ──
  const primaryDays    = 3;
  const secondaryDays  = 4;
  const primaryBase    = (selectedPrimaryHotel?.pricePerNight   ?? 680)   * primaryDays;
  const secondaryBase  = (selectedSecondaryHotel?.pricePerNight ?? 352.5) * secondaryDays;
  const currentTotal   = primaryBase + secondaryBase;
  const optimizedTotal = Math.round(currentTotal * 0.83768);

  if (checkingAuth) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-bg text-ink1">
        <Loader2 className="h-10 w-10 animate-spin text-brand mb-4" />
        <span className="font-display font-medium text-lg">Consulting the Stars...</span>
      </div>
    );
  }

  return (
    <main
      className={cn('flex-1 w-full bg-bg text-ink1 pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-5 sm:gap-8', isRtl ? 'font-arabic' : 'font-body')}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* ── Stepper ── */}
      <section className="w-full card-glass p-4 sm:p-6 md:py-8 flex flex-row md:flex-row items-center justify-between gap-2 sm:gap-4 relative overflow-hidden overflow-x-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-accent/5 to-transparent pointer-events-none" />
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex || bookingStep === 'done';
          const isActive    = idx === currentStepIndex && bookingStep !== 'done';
          const StepIcon    = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 z-10 shrink-0 select-none">
                <div className={cn(
                  'w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold',
                  isCompleted && 'bg-brand border-brand text-bg shadow-brand-glow shadow-sm',
                  isActive    && 'bg-surface2 border-brand text-brand shadow-brand-glow glow-pulse',
                  !isCompleted && !isActive && 'bg-surface1 border-border text-ink3'
                )}>
                  {isCompleted ? <Check size={16} className="stroke-[3px] sm:!w-5 sm:!h-5" />
                    : isActive ? <StepIcon size={16} className="animate-pulse sm:!w-5 sm:!h-5" />
                    : <span className="text-xs sm:text-base">{idx + 1}</span>}
                </div>
                <span className={cn(
                  'text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap',
                  isCompleted && 'text-brand', isActive && 'text-ink1 font-bold',
                  !isCompleted && !isActive && 'text-ink3'
                )}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  'block h-[2px] sm:h-[3px] flex-1 mx-1 sm:mx-2 rounded-full transition-all duration-500 min-w-[12px]',
                  idx < currentStepIndex || bookingStep === 'done' ? 'bg-brand shadow-brand-glow' : 'bg-border'
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
            mobileTab === 'chat' ? 'bg-brand text-bg border-brand' : 'bg-surface1 text-ink2 border-border')}>
          {t.chatTab}
        </button>
        <button type="button" onClick={() => setMobileTab('summary')}
          className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors',
            mobileTab === 'summary' ? 'bg-brand text-bg border-brand' : 'bg-surface1 text-ink2 border-border')}>
          {t.bookingSummaryTab}
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">

        {/* Left: Chat */}
        <section className={cn(
          'lg:col-span-8 flex flex-col card bg-surface1 p-0 border border-border overflow-hidden shadow-card hover:shadow-card-hover',
          'h-[70vh] sm:h-[600px] lg:h-[750px]',
          mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
        )}>
          {/* header */}
          <div className="p-3 sm:p-4 border-b border-border bg-surface2/50 flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xs sm:text-sm md:text-base font-bold text-ink1 flex items-center gap-1.5">
                {t.plannerTitle}
                <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
              </h2>
              <p className="text-[10px] sm:text-xs text-ink2 truncate">{t.plannerSubtitle}</p>
            </div>
            <button type="button" onClick={handleNewTripClick} title={t.newTrip}
              className="shrink-0 flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-ink2 hover:text-brand border border-border hover:border-brand/40 bg-surface1 hover:bg-brand/5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors cursor-pointer">
              <RefreshCw size={13} />
              <span className="hidden sm:inline">{t.newTrip}</span>
            </button>
          </div>

          {/* chat feed */}
          <div ref={chatScrollRef} onScroll={handleChatScroll}
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 scrollbar-thin"
            aria-live="polite">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={cn('flex flex-col max-w-[92%] sm:max-w-[85%] animate-fade-up', isUser ? 'self-end items-end' : 'self-start items-start')}>
                  <div className={cn('p-3 sm:p-4 text-sm md:text-base leading-relaxed break-words shadow-sm', isUser ? 'chat-user font-medium' : 'chat-ai border-l-3 border-accent')}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-ink3 mt-1.5 px-1.5 flex items-center gap-1">
                    {isUser && <Check size={10} className="text-brand shrink-0" />}
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Hotel cards */}
                  {!isUser && msg.hotels && msg.hotels.length > 0 && (
                    <div className="w-full mt-4 overflow-x-auto pb-2 flex gap-3 sm:gap-4 select-none scrollbar-thin max-w-full">
                      {msg.hotels.map((hotel) => {
                        const isSelected = selectedPrimaryHotel?.id === hotel.id || selectedSecondaryHotel?.id === hotel.id;
                        return (
                          <div key={hotel.id} onClick={() => handleSelectHotelCard(hotel)}
                            className={cn(
                              'flex-none w-52 sm:w-64 md:w-72 bg-surface1 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:translate-y-[-4px]',
                              isSelected ? 'border-brand ring-2 ring-brand-glow shadow-brand-glow' : 'border-border hover:border-border-glow hover:shadow-md'
                            )}>
                            <div className="h-28 sm:h-32 w-full relative bg-surface2">
                              <img src={hotel.image} alt={hotel.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 image-overlay pointer-events-none" />
                              {hotel.badge && (
                                <span className={cn(
                                  'absolute top-2.5 right-2.5 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm z-10',
                                  hotel.badge === 'top-pick'   && 'bg-brand text-bg',
                                  hotel.badge === 'selected'   && 'bg-accent text-bg',
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
                                <h3 className="text-xs md:text-sm font-bold text-ink1 line-clamp-1">{hotel.name}</h3>
                                <span className="text-xs md:text-sm font-extrabold text-brand shrink-0">
                                  ${hotel.pricePerNight}<span className="text-[10px] font-normal text-ink3">/{locale === 'ar' ? 'ل' : 'nt'}</span>
                                </span>
                              </div>
                              <p className="text-[10px] md:text-xs text-ink2 flex items-center gap-1">
                                <MapPin size={10} className="text-ink3" />{hotel.location}
                              </p>
                              <span className="badge-base badge-plan-free bg-accent-glow text-accent py-1 font-semibold text-[10px] border border-accent/15">
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
                <div className="chat-ai p-4 flex items-center gap-2.5">
                  <span className="text-xs text-ink2">{t.aiTyping}</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {isHotelsLoading && (
              <div className="self-start flex items-center gap-2 text-xs text-ink2 animate-fade-in px-2">
                <Loader2 size={14} className="animate-spin text-brand" />
                <span>{t.loadingHotels}</span>
              </div>
            )}

            {quotaExceeded && (
              <div className="self-center w-full max-w-[92%] rounded-2xl overflow-hidden border border-brand/30 shadow-brand-glow animate-fade-up">
                <div className="bg-brand/10 px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-brand shrink-0" />
                    <span className="text-sm font-bold text-ink1">{t.quotaTitle}</span>
                  </div>
                  <p className="text-xs text-ink2 leading-relaxed">{t.quotaDesc}</p>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-[10px] text-ink3">{t.quotaReset}</span>
                    <a href="/pricing" className="btn-primary text-xs px-4 py-1.5 rounded-lg font-semibold no-underline">{t.quotaUpgrade}</a>
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
            <div className="px-3 sm:px-4 py-2 flex flex-wrap gap-2 border-t border-border bg-surface1 z-10">
              {currentStep === 'destination' && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'أريد زيارة القاهرة والأقصر' : 'I want to visit Cairo and Luxor')}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {locale === 'ar' ? 'رحلة القاهرة والأقصر' : 'Cairo & Luxor retreat'}
                  </button>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'رحلة بحرية في مرسى علم' : 'A trip to Marsa Alam beach resort')}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {locale === 'ar' ? 'منتجع مرسى علم' : 'Marsa Alam resort'}
                  </button>
                </>
              )}
              {currentStep === 'dates' && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'من ١٢ أكتوبر إلى ٢٠ أكتوبر ٢٠٢٤' : 'From Oct 12 to Oct 20, 2024')}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {t.datesDefault}
                  </button>
                  <button onClick={() => handleSendMessage(t.bestTime)}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {t.bestTime}
                  </button>
                </>
              )}
              {currentStep === 'budget' && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'ميزانية تراثية فاخرة' : 'Luxury heritage budget')}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {t.budgetDefault}
                  </button>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'ميزانية متوسطة' : 'Mid-range budget ($50 - $150)')}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {locale === 'ar' ? 'ميزانية متوسطة' : 'Mid-range budget'}
                  </button>
                </>
              )}
              {(currentStep === 'hotel_selection' || currentStep === 'preferences') && (
                <>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'اقترح فنادق مطلة على النيل بالقاهرة' : 'Suggest Cairo hotels with Nile views')}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {t.suggestCairo}
                  </button>
                  <button onClick={() => handleSendMessage(locale === 'ar' ? 'اقترح فنادق في الأقصر' : 'Suggest Luxor hotels')}
                    className="btn-ghost text-xs py-1.5 border border-border hover:border-accent text-ink2 hover:text-ink1 font-medium bg-surface2/40">
                    {t.suggestLuxor}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Input bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
            className="p-3 sm:p-4 border-t border-border bg-surface2/30 flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 flex items-center min-w-0">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                placeholder={t.chatPlaceholder}
                disabled={isLoading || bookingStep === 'done' || quotaExceeded}
                className="input w-full bg-surface1 pr-12 focus:ring-accent" />
              <button type="button" aria-label="Voice input"
                className="absolute right-3.5 text-ink3 hover:text-brand cursor-pointer p-1 rounded-full transition-colors border-none bg-transparent">
                <Mic size={18} />
              </button>
            </div>
            <button type="submit"
              disabled={!inputText.trim() || isLoading || bookingStep === 'done' || quotaExceeded}
              className={cn(
                'w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-brand text-bg flex items-center justify-center transition-all cursor-pointer border-none shrink-0',
                (!inputText.trim() || isLoading || bookingStep === 'done' || quotaExceeded) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-brand-glow'
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
          <div className="card bg-surface1 border border-border shadow-card hover:shadow-card-hover p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
            <h2 className="font-display text-base md:text-lg font-bold border-b border-border pb-3 flex items-center justify-between">
              {t.bookingSummary}
              <Building2 className="w-5 h-5 text-brand" />
            </h2>

            <div className="flex flex-col gap-4">
              {/* Destination */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-brand" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-ink3 tracking-widest block">{t.destinationLabel}</span>
                  <span className="text-sm font-semibold text-ink1 truncate block">
                    {currentStepIndex > 0
                      ? (conversationCities.length > 0 ? conversationCities.join(' & ') + ', Egypt' : t.cairoEgypt)
                      : t.awaitingSelection}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-brand" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-ink3 tracking-widest block">{t.travelDatesLabel}</span>
                  <span className="text-sm font-semibold text-ink1 truncate block">
                    {currentStepIndex > 1 ? (travelDates ?? t.datesDefault) : t.awaitingSelection}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center shrink-0">
                  <DollarSign size={18} className="text-brand" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-ink3 tracking-widest block">{t.budgetLevelLabel}</span>
                  <span className="text-sm font-semibold text-ink1 truncate block">
                    {currentStepIndex > 2 ? t.budgetDefault : t.awaitingSelection}
                  </span>
                </div>
              </div>
            </div>

            {/* Live itinerary */}
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-ink3 tracking-wider uppercase block">{t.liveItinerary}</span>
              <div className="flex justify-between items-start gap-2">
                <div className="pl-4 border-l-2 border-brand/40 flex flex-col">
                  <span className="text-xs font-bold text-ink1">
                    Oct 12-15 ({conversationCities[0] ?? (locale === 'ar' ? 'القاهرة' : 'Cairo')})
                  </span>
                  <span className="text-[11px] text-ink2 truncate">
                    {selectedPrimaryHotel ? selectedPrimaryHotel.name : t.awaitingSelection}
                  </span>
                </div>
                {selectedPrimaryHotel && (
                  <span className="text-xs font-extrabold text-ink1 shrink-0">
                    ${selectedPrimaryHotel.pricePerNight * primaryDays}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-start gap-2 mt-2">
                <div className="pl-4 border-l-2 border-border/60 flex flex-col">
                  <span className="text-xs font-bold text-ink1">
                    Oct 16-20 ({conversationCities[1] ?? (locale === 'ar' ? 'الأقصر' : 'Luxor')})
                  </span>
                  <span className="text-[11px] text-ink3 italic">
                    {selectedSecondaryHotel ? selectedSecondaryHotel.name : t.awaitingSelection}
                  </span>
                </div>
                {selectedSecondaryHotel && (
                  <span className="text-xs font-extrabold text-ink1 shrink-0">
                    ${selectedSecondaryHotel.pricePerNight * secondaryDays}
                  </span>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-ink3">
                <span>{t.originalPrice}</span>
                <span className="line-through">${currentTotal}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-accent">
                <span className="flex items-center gap-1"><Percent size={12} />{t.rahalDiscount}</span>
                <span>-${currentTotal - optimizedTotal}</span>
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-sm font-bold text-ink1">{t.estTotal}</span>
                <span className="font-display text-xl md:text-2xl font-extrabold text-brand">${optimizedTotal}*</span>
              </div>
              <span className="text-[10px] text-ink3 leading-normal border-t border-border/5 pt-2 text-center block">
                {t.perksNotice}
              </span>
            </div>

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
              disabled={currentStepIndex < 3 || isBookingInProgress || bookingStep === 'done'}
              className={cn(
                'btn-primary w-full py-3.5 flex items-center justify-center gap-2',
                (currentStepIndex < 3 || isBookingInProgress || bookingStep === 'done') && 'opacity-40 cursor-not-allowed'
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
                    {currentStepIndex >= 3 ? t.confirmPayActive : t.confirmPay}
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
          <div className="w-full max-w-sm card bg-surface1 border border-border shadow-2xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 border-2 border-brand flex items-center justify-center text-brand">
              <RefreshCw size={22} />
            </div>
            <p className="text-sm text-ink1 leading-relaxed">{t.newTripConfirm}</p>
            <div className="flex w-full gap-3 mt-2">
              <button onClick={() => setShowNewTripConfirm(false)}
                className="btn-ghost flex-1 py-2.5 border border-border text-ink2 hover:text-ink1 font-medium text-sm">
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={confirmNewTrip} className="btn-primary flex-1 py-2.5 font-semibold text-sm">
                {t.newTrip}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md card bg-surface1 border border-border shadow-2xl p-6 md:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand/10 border-2 border-brand flex items-center justify-center text-brand mb-6 shadow-brand-glow glow-pulse">
              <Sparkles size={32} />
            </div>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-ink1 mb-3">
              {t.bookingSuccessTitle}
            </h2>
            <p className="text-sm text-ink2 leading-relaxed mb-4">{t.bookingSuccessDesc}</p>
            {bookingId && (
              <div className="w-full bg-surface2/60 border border-border rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink3 font-bold">{t.bookingId}</span>
                  <span className="text-brand font-mono font-bold tracking-wider">{bookingId}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-ink2">
              <Loader2 size={14} className="animate-spin text-brand" />
              <span>{locale === 'ar' ? 'جاري التحويل...' : 'Redirecting to payment...'}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}