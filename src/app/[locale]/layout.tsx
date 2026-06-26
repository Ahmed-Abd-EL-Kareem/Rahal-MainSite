import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Naskh_Arabic, Cairo, Sora } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/providers/QueryProvider";
import "../globals.css";

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

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Rahal رحّال - AI-Powered Egypt Travel Planner",
  description: "Bespoke itineraries, heritage insights, and seamless bookings for your Egypt journey.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const isAr = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isAr ? 'rtl' : 'ltr'}
      className={`${playfair.variable} ${inter.variable} ${notoNaskh.variable} ${cairo.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <QueryProvider>
              <Header />
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              <Footer />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
