import type { Metadata } from 'next';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: 'Hotels in Egypt',
    description: 'Discover curated hotels in Egypt with AI-powered search and recommendations.',
    locale,
    path: '/hotels',
  });
}