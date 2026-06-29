// 'use client';

// import React, { use, useState, useEffect } from 'react';
// import { useLocale, useTranslations } from 'next-intl';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useQueryClient } from '@tanstack/react-query';
// import { 
//   ArrowLeft, Calendar, Users, CreditCard, MapPin, 
//   AlertTriangle, Loader2, CheckCircle2, XCircle, Share2, 
//   Printer, Bed, Utensils, Wifi, FileText, Receipt, Sparkles 
// } from 'lucide-react';
// import { useBookingDetailsQuery, useCancelBookingMutation } from '@/hooks/useBookings';
// import Button from '@/components/ui/Button';

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default function BookingDetailsPage({ params }: PageProps) {
//   const { id } = use(params);
//   const locale = useLocale();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const t = useTranslations("bookings");
//    const td = useTranslations("bookings.detail");
 

//   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
//   const [isSharing, setIsSharing] = useState(false);
//   const [isPaying, setIsPaying] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const { data: response, isLoading, isError, refetch } = useBookingDetailsQuery(id);
//   const booking = response?.data;

//   const cancelMutation = useCancelBookingMutation();

//   const isAr = locale === 'ar';

//   // Format date helper
//   const formatDate = (dateStr?: string, includeYear = true) => {
//     if (!dateStr) return '';
//     try {
//       const date = new Date(dateStr);
//       return date.toLocaleDateString(locale, {
//         month: 'short',
//         day: 'numeric',
//         ...(includeYear && { year: 'numeric' }),
//       });
//     } catch {
//       return dateStr;
//     }
//   };

//   // Format price helper
//   const formatPrice = (price?: number, currencyCode?: string) => {
//     if (price === undefined) return '';
//     try {
//       return new Intl.NumberFormat(locale, {
//         style: 'currency',
//         currency: currencyCode || 'USD',
//         maximumFractionDigits: 2,
//       }).format(price);
//     } catch {
//       return `${currencyCode || '$'} ${price}`;
//     }
//   };

//   // Calculate nights count
//   const getNightsCount = () => {
//     if (!booking?.checkIn || !booking?.checkOut) return 0;
//     try {
//       const inDate = new Date(booking.checkIn);
//       const outDate = new Date(booking.checkOut);
//       const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
//       return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     } catch {
//       return 0;
//     }
//   };

//   const nights = getNightsCount();

//   // Cancel booking action
//   const handleCancel = async () => {
//     try {
//       await cancelMutation.mutateAsync(id);
//       setShowCancelConfirm(false);
//     } catch (err) {
//       console.error('Failed to cancel booking:', err);
//     }
//   };

//   // Simulate payment flow
//   const handlePayNow = () => {
//     setIsPaying(true);
//     setTimeout(() => {
//       // Update local TanStack Query cache
//       queryClient.setQueryData(['bookingDetails', id], (oldData: any) => {
//         if (!oldData) return oldData;
//         return {
//           ...oldData,
//           data: {
//             ...oldData.data,
//             paymentStatus: 'succeeded',
//             status: 'confirmed',
//             updatedAt: new Date().toISOString()
//           }
//         };
//       });

//       // Invalidate queries to refresh lists
//       queryClient.invalidateQueries({ queryKey: ['myBookings'] });
//       queryClient.invalidateQueries({ queryKey: ['bookingDetails', id] });

//       setIsPaying(false);
//       router.push(`/${locale}/booking-status?status=success&bookingId=${id}`);
//     }, 2000);
//   };

//   // Share action
//   const handleShare = () => {
//     const bookingUrl = typeof window !== 'undefined' ? window.location.href : '';
//     if (navigator.share) {
//       navigator.share({
//         title: `${td('title')} | ${hotelName}`,
//         text: `My reservation at ${hotelName} in ${hotelCity}`,
//         url: bookingUrl,
//       }).catch(err => console.log('Share canceled', err));
//     } else {
//       setIsSharing(true);
//       navigator.clipboard.writeText(bookingUrl);
//       setTimeout(() => setIsSharing(false), 2000);
//     }
//   };

//   // Print action
//   const handlePrint = () => {
//     window.print();
//   };

//   // Loading state shimmer matching design
//   if (isLoading || !mounted) {
//     return (
//       <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full animate-pulse">
//         <div className="h-6 w-32 bg-surface-container rounded mb-8"></div>
//         <div className="h-10 w-1/3 bg-surface-container rounded mb-4"></div>
//         <div className="h-4 w-1/2 bg-surface-container rounded mb-12"></div>
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           <div className="lg:col-span-8 space-y-6">
//             <div className="h-80 bg-surface-container rounded-xl"></div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="h-48 bg-surface-container rounded-xl"></div>
//               <div className="h-48 bg-surface-container rounded-xl md:col-span-2"></div>
//             </div>
//           </div>
//           <div className="lg:col-span-4 h-96 bg-surface-container rounded-xl"></div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (isError || !booking) {
//     return (
//       <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full flex-1 flex flex-col justify-center items-center">
//         <div className="bg-error/10 p-4 rounded-full text-error mb-4">
//           <AlertTriangle size={32} />
//         </div>
//         <h3 className="font-display font-bold text-xl text-on-surface mb-2">
//           {t('errorStateTitle')}
//         </h3>
//         <p className="text-on-surface-variant text-sm mb-6 text-center max-w-sm">
//           {t('errorStateSubtitle')}
//         </p>
//         <div className="flex gap-4">
//           <Link 
//             href="/bookings"
//             className="px-6 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-semibold text-sm hover:bg-surface-container transition-all"
//           >
//             {td('back')}
//           </Link>
//           <button
//             onClick={() => refetch()}
//             className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
//           >
//             {t('retry')}
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const hotelObj = typeof booking.hotel === 'object' ? booking.hotel : null;
//   const hotelName = hotelObj ? (locale === 'ar' ? hotelObj.name.ar : hotelObj.name.en) : 'Hotel';
//   const hotelCity = hotelObj ? hotelObj.city : 'Egypt';
//   const hotelAddress = hotelObj && 'address' in hotelObj ? (hotelObj.address as string) : 'Cairo, Egypt';
//   const coverImage = hotelObj?.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcW6zabnz89JakVv5tJpTIym0oQM78RY6SoYtGrhmUNswL26nCek7IYwkLkcG4qdRMixni_LrE_bRTauUSsRcEsILaimAT4IafrOoOpQwnJTDYiGirKuWJWbljpuUCSDz-WBR6h0g61zZbghCYGwZGWytjh7toWMiKIb3f5v2Jg_V7ZmgGZOT2VfLePp9q3GZk-uFjS1U1I6y_fi3GWsAU8Ufx7TYrJc4rVfSrJxdPpwCOnzjSZX53OR_VbnVt9pZI31H-wLaz95A';

//   const checkInDate = new Date(booking.checkIn);
//   const isFutureBooking = checkInDate > new Date();
//   const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && isFutureBooking;
//   const needsPayment = booking.paymentStatus === 'pending' && booking.status !== 'canceled';

//   // Math price breakdown
//   const totalPrice = booking.totalPrice || 0;
//   const basePrice = totalPrice / 1.26;
//   const serviceCharge = basePrice * 0.12;
//   const vat = basePrice * 0.14;
//   const nightlyRate = basePrice / (nights || 1);

//   const paymentDate = booking.updatedAt ? formatDate(booking.updatedAt) : formatDate(booking.createdAt);

//   return (
//     <main className="pt-28 pb-12 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full flex-grow">
//       {/* Back Action & Title Section */}
//       <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
//         <div>
//           <Link 
//             href="/bookings"
//             className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all mb-4 text-sm font-semibold"
//           >
//             <ArrowLeft size={16} className={`transition-transform ${isAr ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
//             <span>{td('back')}</span>
//           </Link>
          
//           <div className="flex items-center gap-4 flex-wrap">
//             <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface leading-tight">
//               {td('title')}
//             </h1>
            
//             <span className={`px-4 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 border ${
//               booking.status === 'confirmed' 
//                 ? 'bg-success/10 text-success border-success/20' 
//                 : booking.status === 'canceled'
//                 ? 'bg-error/10 text-error border-error/20'
//                 : 'bg-primary/10 text-primary border-primary/20'
//             }`}>
//               {booking.status === 'confirmed' ? (
//                 <>
//                   <CheckCircle2 size={14} className="text-success fill-success/10" />
//                   {t('status.confirmed')}
//                 </>
//               ) : booking.status === 'canceled' ? (
//                 <>
//                   <XCircle size={14} className="text-error fill-error/10" />
//                   {t('status.canceled')}
//                 </>
//               ) : (
//                 <>
//                   <Loader2 size={14} className="animate-spin text-primary" />
//                   {t('status.pending')}
//                 </>
//               )}
//             </span>
//           </div>
          
//           <p className="text-on-surface-variant mt-2 text-sm font-medium">
//             {td('reservationId')}: #RH-{booking._id.slice(-5).toUpperCase()}-{hotelCity.slice(0,3).toUpperCase()}
//           </p>
//         </div>

//         {/* Action Controls */}
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={handleShare}
//             className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant/30 bg-surface hover:bg-surface-container-low active:scale-95 transition-all text-xs font-bold cursor-pointer"
//           >
//             <Share2 size={16} className="text-on-surface-variant" />
//             <span>{isSharing ? (isAr ? 'تم النسخ!' : 'Copied!') : td('share')}</span>
//           </button>

//           <button 
//             onClick={handlePrint}
//             className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant/30 bg-surface hover:bg-surface-container-low active:scale-95 transition-all text-xs font-bold cursor-pointer"
//           >
//             <Printer size={16} className="text-on-surface-variant" />
//             <span>{td('printPdf')}</span>
//           </button>
//         </div>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
//         {/* Left Column: Details */}
//         <div className="lg:col-span-8 space-y-gutter">
          
//           {/* Cover Image Card */}
//           <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden shadow-md border border-outline-variant/10 group">
//             <div 
//               className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
//               style={{ backgroundImage: `url('${coverImage}')` }}
//               role="img"
//               aria-label={hotelName}
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
//             <div className="absolute bottom-6 left-6 right-6 text-white text-left rtl:text-right">
//               <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 leading-tight">
//                 {hotelName}
//               </h2>
//               <p className="flex items-center gap-1.5 opacity-90 text-xs md:text-sm font-medium">
//                 <MapPin size={16} className="text-primary-fixed-dim" />
//                 <span>{hotelAddress}</span>
//               </p>
//             </div>
//           </div>

//           {/* Bento Grid Info Section */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            
//             {/* Date Card */}
//             <div className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all flex flex-col justify-between">
//               <div className="flex items-center gap-2.5 text-primary mb-4 font-semibold">
//                 <Calendar size={18} />
//                 <span className="text-xs tracking-wider uppercase font-bold">{td('datesTitle')}</span>
//               </div>
//               <div className="space-y-4 text-left rtl:text-right">
//                 <div>
//                   <p className="text-[10px] uppercase tracking-wider text-outline font-bold mb-1">{t('checkIn')}</p>
//                   <p className="text-sm font-bold text-on-surface">{formatDate(booking.checkIn)}</p>
//                   <p className="text-xs text-on-surface-variant font-medium">{td('checkInTime')}</p>
//                 </div>
//                 <div className="border-t border-outline-variant/20 pt-4">
//                   <p className="text-[10px] uppercase tracking-wider text-outline font-bold mb-1">{t('checkOut')}</p>
//                   <p className="text-sm font-bold text-on-surface">{formatDate(booking.checkOut)}</p>
//                   <p className="text-xs text-on-surface-variant font-medium">{td('checkOutTime')}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Reservation details Card (2/3 width on desktop) */}
//             <div className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all md:col-span-2 flex flex-col justify-between">
//               <div className="flex items-center gap-2.5 text-primary mb-6 font-semibold">
//                 <Users size={18} />
//                 <span className="text-xs tracking-wider uppercase font-bold">{td('detailsTitle')}</span>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left rtl:text-right">
//                 <div className="flex gap-3.5 items-start">
//                   <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
//                     <Users size={18} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-on-surface">
//                       {td('guestsCount', { guests: booking.guests })}
//                     </p>
//                     <p className="text-xs text-on-surface-variant font-medium">
//                       {td('guestsDetail', { adults: booking.guests, children: 0 })}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex gap-3.5 items-start">
//                   <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
//                     <Bed size={18} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-on-surface">{td('roomType')}</p>
//                     <p className="text-xs text-on-surface-variant font-medium">{td('roomDetail')}</p>
//                   </div>
//                 </div>

//                 <div className="flex gap-3.5 items-start">
//                   <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
//                     <Utensils size={18} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-on-surface">{td('breakfastTitle')}</p>
//                     <p className="text-xs text-on-surface-variant font-medium">{td('breakfastDetail')}</p>
//                   </div>
//                 </div>

//                 <div className="flex gap-3.5 items-start">
//                   <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
//                     <Wifi size={18} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-on-surface">{td('wifiTitle')}</p>
//                     <p className="text-xs text-on-surface-variant font-medium">{td('wifiDetail')}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Special Requests */}
//           <div className="p-6 md:p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all">
//             <div className="flex items-center gap-2.5 text-primary mb-4 font-semibold">
//               <FileText size={18} />
//               <h3 className="font-display font-bold text-lg text-on-surface">{td('specialRequests')}</h3>
//             </div>
//             <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 italic text-on-surface-variant leading-relaxed text-sm md:text-base text-left rtl:text-right">
//               {booking.specialRequests ? `"${booking.specialRequests}"` : td('specialRequestsNone')}
//             </div>
//           </div>

//           {/* Danger Zone */}
//           {booking.status !== 'canceled' && (
//             <div className="p-6 md:p-8 bg-error/5 border border-error/20 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
//               <div className="text-center md:text-left rtl:md:text-right">
//                 <h4 className="font-semibold text-error flex items-center justify-center md:justify-start gap-2 text-sm">
//                   <AlertTriangle size={18} />
//                   <span>{td('dangerZone')}</span>
//                 </h4>
//                 <p className="text-on-surface-variant text-xs md:text-sm mt-1 leading-relaxed font-semibold">
//                   {td('dangerZoneDesc')}
//                 </p>
//               </div>

//               <div className="shrink-0 w-full md:w-auto">
//                 {showCancelConfirm ? (
//                   <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-error/20 shadow-sm w-full justify-between">
//                     <span className="text-xs font-bold text-error px-2 hidden sm:inline">{td('cancelConfirmTitle')}</span>
//                     <div className="flex gap-1.5">
//                       <button 
//                         onClick={handleCancel}
//                         disabled={cancelMutation.isPending}
//                         className="px-4 py-2 bg-error text-white text-xs font-semibold rounded hover:bg-error/90 transition-all flex items-center gap-1 cursor-pointer"
//                       >
//                         {cancelMutation.isPending && <Loader2 size={12} className="animate-spin" />}
//                         {isAr ? 'نعم، إلغاء' : 'Yes, Cancel'}
//                       </button>
//                       <button 
//                         onClick={() => setShowCancelConfirm(false)}
//                         disabled={cancelMutation.isPending}
//                         className="px-4 py-2 bg-surface text-on-surface text-xs font-semibold rounded border border-outline-variant hover:bg-surface-container transition-all cursor-pointer"
//                       >
//                         {isAr ? 'تراجع' : 'No'}
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   canCancel && (
//                     <button 
//                       onClick={() => setShowCancelConfirm(true)}
//                       className="w-full md:w-auto px-6 py-2.5 rounded-lg border-2 border-error text-error font-semibold hover:bg-error hover:text-white active:scale-95 transition-all text-xs cursor-pointer text-center"
//                     >
//                       {t('cancelBooking')}
//                     </button>
//                   )
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right Column: Payment & Support */}
//         <div className="lg:col-span-4 space-y-gutter">
          
//           {/* Payment Summary Box */}
//           <div className="p-6 md:p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all sticky top-24">
//             <h3 className="font-display font-bold text-xl text-on-surface mb-6 pb-4 border-b border-outline-variant/20 text-left rtl:text-right">
//               {td('paymentSummary')}
//             </h3>

//             {/* Prices */}
//             <div className="space-y-4 mb-8 text-sm leading-relaxed text-left rtl:text-right">
//               <div className="flex justify-between text-on-surface-variant">
//                 <span>{td('nightsPrice', { nights, price: formatPrice(nightlyRate, booking.currency) })}</span>
//                 <span className="font-bold text-on-surface">{formatPrice(basePrice, booking.currency)}</span>
//               </div>
              
//               <div className="flex justify-between text-on-surface-variant">
//                 <span>{td('serviceCharge')}</span>
//                 <span className="font-bold text-on-surface">{formatPrice(serviceCharge, booking.currency)}</span>
//               </div>

//               <div className="flex justify-between text-on-surface-variant">
//                 <span>{td('vat')}</span>
//                 <span className="font-bold text-on-surface">{formatPrice(vat, booking.currency)}</span>
//               </div>

//               <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
//                 <span className="font-bold text-on-surface text-base">{td('totalPaid')}</span>
//                 <span className="font-display font-bold text-primary text-2xl">
//                   {formatPrice(totalPrice, booking.currency)}
//                 </span>
//               </div>
//             </div>

//             {/* Card representation if paid */}
//             {booking.paymentStatus === 'succeeded' ? (
//               <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex items-center gap-4 mb-8 text-left rtl:text-right">
//                 <div className="w-12 h-8 bg-on-surface text-white rounded flex items-center justify-center text-[10px] font-bold shrink-0">
//                   VISA
//                 </div>
//                 <div>
//                   <p className="font-bold text-xs text-on-surface">
//                     {td('visaCard', { last4: '4421' })}
//                   </p>
//                   <p className="text-on-surface-variant text-[10px]">
//                     {td('paidOn', { date: paymentDate })}
//                   </p>
//                 </div>
//               </div>
//             ) : null}

//             {/* Action CTA buttons */}
//             {needsPayment ? (
//               <button 
//                 onClick={handlePayNow}
//                 disabled={isPaying}
//                 className="w-full py-4 rounded-xl bg-primary text-on-primary hover:bg-primary/95 transition-all font-bold active:scale-95 shadow-md hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer border border-primary/20"
//               >
//                 {isPaying ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     <span>{t('paying')}</span>
//                   </>
//                 ) : (
//                   <>
//                     <CreditCard size={16} />
//                     <span>{t('payNow')}</span>
//                   </>
//                 )}
//               </button>
//             ) : (
//               <button 
//                 onClick={handlePrint}
//                 className="w-full py-4 rounded-xl bg-primary text-on-primary hover:bg-primary/95 transition-all font-bold active:scale-95 shadow-md hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer border border-primary/20"
//               >
//                 <Receipt size={16} />
//                 <span>{td('viewInvoice')}</span>
//               </button>
//             )}

//             {/* Rahal Insight Side-Card */}
//             <div className="mt-8 p-5 bg-secondary/5 border border-secondary/10 rounded-xl relative overflow-hidden group text-left rtl:text-right">
//               <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors pointer-events-none" />
//               <div className="flex items-center gap-1.5 text-secondary mb-3 font-semibold">
//                 <Sparkles size={16} className="fill-current animate-pulse" />
//                 <span className="font-bold uppercase tracking-widest text-[10px]">{td('rahalInsightTitle')}</span>
//               </div>
//               <p className="text-on-surface-variant text-xs leading-relaxed font-medium">
//                 {td('rahalInsightDesc')}
//               </p>
//             </div>
//           </div>
//         </div>

//       </div>
//     </main>
//   );
// }
'use client';

import React, { use, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Users, CreditCard, MapPin, 
  AlertTriangle, Loader2, CheckCircle2, XCircle, Share2, 
  Printer, Bed, Utensils, Wifi, FileText, Receipt, Sparkles 
} from 'lucide-react';
import { useBookingDetailsQuery, useCancelBookingMutation, useCreateCheckoutMutation } from '@/hooks/useBookings';
import { getLocalized, type LocalizedString } from '@/lib/utils/localized';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Helper for localized API fields — see src/lib/utils/localized.ts

export default function BookingDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations("bookings");
  const td = useTranslations("bookings.detail");

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: response, isLoading, isError, refetch } = useBookingDetailsQuery(id);
  const booking = response?.data;

  const cancelMutation = useCancelBookingMutation();
  const checkoutMutation = useCreateCheckoutMutation();

  const isAr = locale === 'ar';

  // Format date helper
  const formatDate = (dateStr?: string, includeYear = true) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        ...(includeYear && { year: 'numeric' }),
      });
    } catch {
      return dateStr;
    }
  };

  // Format price helper
  const formatPrice = (price?: number, currencyCode?: string) => {
    if (price === undefined) return '';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode || 'USD',
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${currencyCode || '$'} ${price}`;
    }
  };

  // Calculate nights count
  const getNightsCount = () => {
    if (!booking?.checkIn || !booking?.checkOut) return 0;
    try {
      const inDate = new Date(booking.checkIn);
      const outDate = new Date(booking.checkOut);
      const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const nights = getNightsCount();

  // Cancel booking action
  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  // Pay Now Stripe checkout action
  const handlePayNow = async () => {
    try {
      await checkoutMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to initiate payment:', err);
    }
  };

  // Share action
  const handleShare = () => {
    if (!booking) return;
    const shareHotelObj = typeof booking.hotel === 'object' ? booking.hotel : null;
    const shareHotelName = getLocalized(shareHotelObj?.name as LocalizedString, locale) || 'Hotel';
    const shareHotelCity = getLocalized(shareHotelObj?.city as LocalizedString, locale) || 'Egypt';
    const bookingUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({
        title: `${td('title')} | ${shareHotelName}`,
        text: `My reservation at ${shareHotelName} in ${shareHotelCity}`,
        url: bookingUrl,
      }).catch(err => console.log('Share canceled', err));
    } else {
      setIsSharing(true);
      navigator.clipboard.writeText(bookingUrl);
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  // Print action
  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isLoading || !mounted) {
    return (
      <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full animate-pulse">
        <div className="h-6 w-32 bg-surface-container rounded mb-8"></div>
        <div className="h-10 w-1/3 bg-surface-container rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-surface-container rounded mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-80 bg-surface-container rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-surface-container rounded-xl"></div>
              <div className="h-48 bg-surface-container rounded-xl md:col-span-2"></div>
            </div>
          </div>
          <div className="lg:col-span-4 h-96 bg-surface-container rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !booking) {
    return (
      <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full flex-1 flex flex-col justify-center items-center">
        <div className="bg-error/10 p-4 rounded-full text-error mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="font-display font-bold text-xl text-on-surface mb-2">
          {t('errorStateTitle')}
        </h3>
        <p className="text-on-surface-variant text-sm mb-6 text-center max-w-sm">
          {t('errorStateSubtitle')}
        </p>
        <div className="flex gap-4">
          <Link 
            href="/bookings"
            className="px-6 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-semibold text-sm hover:bg-surface-container transition-all"
          >
            {td('back')}
          </Link>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const hotelObj = typeof booking.hotel === 'object' ? booking.hotel : null;

  // ─── [تعديل 3] hotel.name ────────────────────────────────────────────────────
  // قبل: كان يتحقق من locale يدويًا بدون حماية من الـ undefined.
  // بعد: getLocalized يتعامل مع string | {en,ar} | undefined بأمان.
  const hotelName = getLocalized(hotelObj?.name as LocalizedString, locale) || 'Hotel';
  const hotelCity = getLocalized(hotelObj?.city as LocalizedString, locale) || 'Egypt';
  const hotelAddress = getLocalized(hotelObj?.address as LocalizedString, locale) || 'Cairo, Egypt';

  const coverImage = hotelObj?.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcW6zabnz89JakVv5tJpTIym0oQM78RY6SoYtGrhmUNswL26nCek7IYwkLkcG4qdRMixni_LrE_bRTauUSsRcEsILaimAT4IafrOoOpQwnJTDYiGirKuWJWbljpuUCSDz-WBR6h0g61zZbghCYGwZGWytjh7toWMiKIb3f5v2Jg_V7ZmgGZOT2VfLePp9q3GZk-uFjS1U1I6y_fi3GWsAU8Ufx7TYrJc4rVfSrJxdPpwCOnzjSZX53OR_VbnVt9pZI31H-wLaz95A';

  const checkInDate = new Date(booking.checkIn);
  const isFutureBooking = checkInDate > new Date();

  // ─── [تعديل 6] booking.status ────────────────────────────────────────────────
  // قبل: booking.status يُستخدم مباشرة في مقارنات و JSX.
  // المشكلة: إذا كان { en: "confirmed", ar: "مؤكد" } فالمقارنة ستفشل دائمًا.
  // بعد: نحوّله لـ string أولًا ثم نستخدمه.
  const bookingStatus = getLocalized(booking.status as LocalizedString, locale) || booking.status;
  const bookingPaymentStatus = getLocalized(booking.paymentStatus as LocalizedString, locale) || booking.paymentStatus;
  // ────────────────────────────────────────────────────────────────────────────

  const canCancel = (bookingStatus === 'pending' || bookingStatus === 'confirmed') && isFutureBooking;
  const needsPayment = bookingPaymentStatus === 'pending' && bookingStatus !== 'canceled';

  // Math price breakdown
  const totalPrice = booking.totalPrice || 0;
  const basePrice = totalPrice / 1.26;
  const serviceCharge = basePrice * 0.12;
  const vat = basePrice * 0.14;
  const nightlyRate = basePrice / (nights || 1);

  const paymentDate = booking.updatedAt ? formatDate(booking.updatedAt) : formatDate(booking.createdAt);

  // ─── [تعديل 7] booking.specialRequests ───────────────────────────────────────
  // قبل: `{booking.specialRequests ? \`"${booking.specialRequests}"\` : td('...')}`
  // المشكلة: specialRequests قد يكون { en: "...", ar: "..." }
  // بعد: نحوّله لـ string أولًا.
  const specialRequestsText = getLocalized(booking.specialRequests as LocalizedString, locale);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <main className="pt-28 pb-12 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full flex-grow">
      {/* Back Action & Title Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <Link 
            href="/bookings"
            className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all mb-4 text-sm font-semibold"
          >
            <ArrowLeft size={16} className={`transition-transform ${isAr ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
            <span>{td('back')}</span>
          </Link>
          
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface leading-tight">
              {td('title')}
            </h1>
            
            {/* ─── [تعديل 8] عرض status badge ──────────────────────────────────────
                قبل: booking.status مباشرة في className ternary و JSX.
                بعد: bookingStatus (string مضمون). */}
            <span className={`px-4 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 border ${
              bookingStatus === 'confirmed' 
                ? 'bg-success/10 text-success border-success/20' 
                : bookingStatus === 'canceled'
                ? 'bg-error/10 text-error border-error/20'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              {bookingStatus === 'confirmed' ? (
                <>
                  <CheckCircle2 size={14} className="text-success fill-success/10" />
                  {t('status.confirmed')}
                </>
              ) : bookingStatus === 'canceled' ? (
                <>
                  <XCircle size={14} className="text-error fill-error/10" />
                  {t('status.canceled')}
                </>
              ) : (
                <>
                  <Loader2 size={14} className="animate-spin text-primary" />
                  {t('status.pending')}
                </>
              )}
            </span>
            {/* ──────────────────────────────────────────────────────────────────── */}
          </div>
          
          <p className="text-on-surface-variant mt-2 text-sm font-medium">
            {/* ─── [تعديل 9] hotelCity في reservation ID ──────────────────────────
                قبل: hotelCity.slice(0,3) — إذا كان object سيكون "[ob".slice(0,3)
                بعد: hotelCity الآن string مضمون من getLocalized. */}
            {td('reservationId')}: #RH-{booking._id.slice(-5).toUpperCase()}-{hotelCity.slice(0,3).toUpperCase()}
            {/* ──────────────────────────────────────────────────────────────────── */}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant/30 bg-surface hover:bg-surface-container-low active:scale-95 transition-all text-xs font-bold cursor-pointer"
          >
            <Share2 size={16} className="text-on-surface-variant" />
            <span>{isSharing ? (isAr ? 'تم النسخ!' : 'Copied!') : td('share')}</span>
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant/30 bg-surface hover:bg-surface-container-low active:scale-95 transition-all text-xs font-bold cursor-pointer"
          >
            <Printer size={16} className="text-on-surface-variant" />
            <span>{td('printPdf')}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-gutter">
          
          {/* Cover Image Card */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden shadow-md border border-outline-variant/10 group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: `url('${coverImage}')` }}
              role="img"
              aria-label={hotelName}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white text-left rtl:text-right">
              {/* hotelName و hotelAddress الآن strings مضمونة */}
              <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 leading-tight">
                {hotelName}
              </h2>
              <p className="flex items-center gap-1.5 opacity-90 text-xs md:text-sm font-medium">
                <MapPin size={16} className="text-primary-fixed-dim" />
                <span>{hotelAddress}</span>
              </p>
            </div>
          </div>

          {/* Bento Grid Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            
            {/* Date Card */}
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all flex flex-col justify-between">
              <div className="flex items-center gap-2.5 text-primary mb-4 font-semibold">
                <Calendar size={18} />
                <span className="text-xs tracking-wider uppercase font-bold">{td('datesTitle')}</span>
              </div>
              <div className="space-y-4 text-left rtl:text-right">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-outline font-bold mb-1">{t('checkIn')}</p>
                  <p className="text-sm font-bold text-on-surface">{formatDate(booking.checkIn)}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{td('checkInTime')}</p>
                </div>
                <div className="border-t border-outline-variant/20 pt-4">
                  <p className="text-[10px] uppercase tracking-wider text-outline font-bold mb-1">{t('checkOut')}</p>
                  <p className="text-sm font-bold text-on-surface">{formatDate(booking.checkOut)}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{td('checkOutTime')}</p>
                </div>
              </div>
            </div>

            {/* Reservation details Card */}
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all md:col-span-2 flex flex-col justify-between">
              <div className="flex items-center gap-2.5 text-primary mb-6 font-semibold">
                <Users size={18} />
                <span className="text-xs tracking-wider uppercase font-bold">{td('detailsTitle')}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left rtl:text-right">
                <div className="flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      {td('guestsCount', { guests: booking.guests })}
                    </p>
                    <p className="text-xs text-on-surface-variant font-medium">
                      {td('guestsDetail', { adults: booking.guests, children: 0 })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Bed size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{td('roomType')}</p>
                    <p className="text-xs text-on-surface-variant font-medium">{td('roomDetail')}</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{td('breakfastTitle')}</p>
                    <p className="text-xs text-on-surface-variant font-medium">{td('breakfastDetail')}</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Wifi size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{td('wifiTitle')}</p>
                    <p className="text-xs text-on-surface-variant font-medium">{td('wifiDetail')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="p-6 md:p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all">
            <div className="flex items-center gap-2.5 text-primary mb-4 font-semibold">
              <FileText size={18} />
              <h3 className="font-display font-bold text-lg text-on-surface">{td('specialRequests')}</h3>
            </div>
            {/* ─── [تعديل 10] specialRequests ──────────────────────────────────────
                قبل: `{booking.specialRequests ? \`"${booking.specialRequests}"\` : ...}`
                المشكلة: إذا كان object سيُعرض [object Object] أو يرمي خطأ.
                بعد: specialRequestsText هو string مضمون من getLocalized. */}
            <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 italic text-on-surface-variant leading-relaxed text-sm md:text-base text-left rtl:text-right">
              {specialRequestsText ? `"${specialRequestsText}"` : td('specialRequestsNone')}
            </div>
            {/* ──────────────────────────────────────────────────────────────────── */}
          </div>

          {/* Danger Zone */}
          {/* ─── [تعديل 11] bookingStatus بدلاً من booking.status ──────────────── */}
          {bookingStatus !== 'canceled' && (
            <div className="p-6 md:p-8 bg-error/5 border border-error/20 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left rtl:md:text-right">
                <h4 className="font-semibold text-error flex items-center justify-center md:justify-start gap-2 text-sm">
                  <AlertTriangle size={18} />
                  <span>{td('dangerZone')}</span>
                </h4>
                <p className="text-on-surface-variant text-xs md:text-sm mt-1 leading-relaxed font-semibold">
                  {td('dangerZoneDesc')}
                </p>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                {showCancelConfirm ? (
                  <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-error/20 shadow-sm w-full justify-between">
                    <span className="text-xs font-bold text-error px-2 hidden sm:inline">{td('cancelConfirmTitle')}</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                        className="px-4 py-2 bg-error text-white text-xs font-semibold rounded hover:bg-error/90 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {cancelMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                        {isAr ? 'نعم، إلغاء' : 'Yes, Cancel'}
                      </button>
                      <button 
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={cancelMutation.isPending}
                        className="px-4 py-2 bg-surface text-on-surface text-xs font-semibold rounded border border-outline-variant hover:bg-surface-container transition-all cursor-pointer"
                      >
                        {isAr ? 'تراجع' : 'No'}
                      </button>
                    </div>
                  </div>
                ) : (
                  canCancel && (
                    <button 
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full md:w-auto px-6 py-2.5 rounded-lg border-2 border-error text-error font-semibold hover:bg-error hover:text-white active:scale-95 transition-all text-xs cursor-pointer text-center"
                    >
                      {t('cancelBooking')}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
          {/* ──────────────────────────────────────────────────────────────────── */}
        </div>

        {/* Right Column: Payment & Support */}
        <div className="lg:col-span-4 space-y-gutter">
          
          {/* Payment Summary Box */}
          <div className="p-6 md:p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:border-outline/20 transition-all sticky top-24">
            <h3 className="font-display font-bold text-xl text-on-surface mb-6 pb-4 border-b border-outline-variant/20 text-left rtl:text-right">
              {td('paymentSummary')}
            </h3>

            {/* Prices */}
            <div className="space-y-4 mb-8 text-sm leading-relaxed text-left rtl:text-right">
              <div className="flex justify-between text-on-surface-variant">
                <span>{td('nightsPrice', { nights, price: formatPrice(nightlyRate, booking.currency) })}</span>
                <span className="font-bold text-on-surface">{formatPrice(basePrice, booking.currency)}</span>
              </div>
              
              <div className="flex justify-between text-on-surface-variant">
                <span>{td('serviceCharge')}</span>
                <span className="font-bold text-on-surface">{formatPrice(serviceCharge, booking.currency)}</span>
              </div>

              <div className="flex justify-between text-on-surface-variant">
                <span>{td('vat')}</span>
                <span className="font-bold text-on-surface">{formatPrice(vat, booking.currency)}</span>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="font-bold text-on-surface text-base">{td('totalPaid')}</span>
                <span className="font-display font-bold text-primary text-2xl">
                  {formatPrice(totalPrice, booking.currency)}
                </span>
              </div>
            </div>

            {/* ─── [تعديل 12] paymentStatus check ─────────────────────────────────
                قبل: booking.paymentStatus === 'succeeded'
                بعد: bookingPaymentStatus (string مضمون). */}
            {bookingPaymentStatus === 'succeeded' ? (
              <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex items-center gap-4 mb-8 text-left rtl:text-right">
                <div className="w-12 h-8 bg-on-surface text-white rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                  VISA
                </div>
                <div>
                  <p className="font-bold text-xs text-on-surface">
                    {td('visaCard', { last4: '4421' })}
                  </p>
                  <p className="text-on-surface-variant text-[10px]">
                    {td('paidOn', { date: paymentDate })}
                  </p>
                </div>
              </div>
            ) : null}
            {/* ──────────────────────────────────────────────────────────────────── */}

            {/* Action CTA buttons */}
            {needsPayment ? (
              <button 
                onClick={handlePayNow}
                disabled={checkoutMutation.isPending}
                className="w-full py-4 rounded-xl bg-primary text-on-primary hover:bg-primary/95 transition-all font-bold active:scale-95 shadow-md hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer border border-primary/20"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('paying')}</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>{t('payNow')}</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handlePrint}
                className="w-full py-4 rounded-xl bg-primary text-on-primary hover:bg-primary/95 transition-all font-bold active:scale-95 shadow-md hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer border border-primary/20"
              >
                <Receipt size={16} />
                <span>{td('viewInvoice')}</span>
              </button>
            )}

            {/* Rahal Insight Side-Card */}
            <div className="mt-8 p-5 bg-secondary/5 border border-secondary/10 rounded-xl relative overflow-hidden group text-left rtl:text-right">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors pointer-events-none" />
              <div className="flex items-center gap-1.5 text-secondary mb-3 font-semibold">
                <Sparkles size={16} className="fill-current animate-pulse" />
                <span className="font-bold uppercase tracking-widest text-[10px]">{td('rahalInsightTitle')}</span>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed font-medium">
                {td('rahalInsightDesc')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}