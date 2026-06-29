import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo/metadata';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import PopularDestinations from '@/components/home/PopularDestinations';
import FeatureGrid from '@/components/home/FeatureGrid';
import PopularHotels from '@/components/home/PopularHotels';
import AIChatTeaser from '@/components/home/AIChatTeaser';
import PricingSection from '@/components/home/PricingSection';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });
  
  return generateSeoMetadata({
    title: t('title'),
    description: t('subtitle'),
    locale,
    path: '/',
  });
}

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* 1. Hero banner with pyramids backdrop & stats */}
      <Hero />
      
      {/* 2. Numbered 3-step guide */}
      <HowItWorks />
      
      {/* 3. Bento grid of popular destinations */}
      <PopularDestinations />
      
      {/* 4. AI-Powered features grid + AI Planner papyrus banner */}
      <FeatureGrid />
      
      {/* 5. Curated hotels list */}
      <PopularHotels />
      
      {/* 6. AI chatbot description & phone UI mockup */}
      <AIChatTeaser />
      
      {/* 7. Free vs Pro pricing tier comparison */}
      <PricingSection />
      
      {/* 8. User reviews and testimonials */}
      <Testimonials />
      
      {/* 9. Concluding dark pyramids banner */}
      <CTASection />
    </main>
  );
}
