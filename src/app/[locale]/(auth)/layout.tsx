import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Naskh_Arabic, Cairo } from "next/font/google";
import { getLocale, getMessages } from 'next-intl/server';

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["600", "700"],
  variable: "--font-noto-naskh",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Rahal رحّال - AI-Powered Egypt Travel Planner",
  description: "Bespoke itineraries, heritage insights, and seamless bookings for your Egypt journey.",
};

export default async function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return (
    <div
      className={`${playfair.variable} ${inter.variable} ${notoNaskh.variable} ${cairo.variable} h-full antialiased`}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={locale}
    >
      <div className="min-h-full flex flex-col bg-background text-on-background">
        {children}
      </div>
    </div>
  );
}