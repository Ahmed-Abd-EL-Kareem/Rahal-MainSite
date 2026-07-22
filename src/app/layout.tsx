import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rahal.app"),
  title: {
    default: "Rahal رحّال - AI-Powered Egypt Travel Planner",
    template: "%s | Rahal رحّال",
  },
  description: "Bespoke itineraries, heritage insights, and seamless bookings for your Egypt journey.",
  keywords: [
    "Egypt travel",
    "travel planner",
    "AI travel",
    "Egypt tourism",
    "itinerary planner",
    "heritage travel",
    "book Egypt tours",
    "Rahal",
    "رحال",
  ],
  authors: [{ name: "Rahal Team" }],
  creator: "Rahal",
  publisher: "Rahal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_EG"],
    url: "https://rahal.app",
    siteName: "Rahal رحّال",
    title: "Rahal رحّال - AI-Powered Egypt Travel Planner",
    description: "Bespoke itineraries, heritage insights, and seamless bookings for your Egypt journey.",
    images: [
      {
        url: "/images/logo-2.png",
        width: 500,
        height: 500,
        alt: "Rahal رحّال Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rahal رحّال - AI-Powered Egypt Travel Planner",
    description: "Bespoke itineraries, heritage insights, and seamless bookings for your Egypt journey.",
    images: ["/images/logo-2.png"],
    creator: "@rahal",
  },
  icons: {
    icon: "/images/logo-2.png",
    shortcut: "/images/logo-2.png",
    apple: "/images/logo-2.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      {children}
    </html>
  );
}