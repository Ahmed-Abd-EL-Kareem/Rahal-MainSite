import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Naskh_Arabic, Cairo } from "next/font/google";
import { getMessages } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import ClientProviders from "@/components/providers/ClientProviders";
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr
      ? "رحال - مخطط رحلات مصر المدعوم بالذكاء الاصطناعي"
      : "Rahal - AI-Powered Egypt Travel Planner",
    description: isAr
      ? "مسارات مخصصة، رؤى تراثية، وحجوزات سلسة لرحلتك في مصر."
      : "Bespoke itineraries, heritage insights, and seamless bookings for your Egypt journey.",
    alternates: {
      languages: {
        en: "https://rahal.app",
        ar: "https://rahal.app/ar",
        "x-default": "https://rahal.app",
      },
    },
    openGraph: {
      locale: isAr ? "ar_EG" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_EG",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const isAr = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isAr ? "rtl" : "ltr"}
      className={`${playfair.variable} ${inter.variable} ${notoNaskh.variable} ${cairo.variable} light h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <ClientProviders locale={locale} messages={messages}>
          <Header />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <FloatingChatButton />
        </ClientProviders>
      </body>
    </html>
  );
}