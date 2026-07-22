'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Globe, 
  Users, 
  Heart, 
  Award, 
  Send, 
  CheckCircle2,
  Cpu,
  MapPin,
  History
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

export default function AboutPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  // Content dictionaries for bilingual support matching project tone
  const content = {
    hero: {
      badge: isAr ? 'قصتنا ورؤيتنا' : 'Our Story & Vision',
      title: isAr ? 'رائدو مستقبل السفر الذكي في مصر' : 'Pioneering the Future of Travel in Egypt',
      subtitle: isAr
        ? 'رحّال هو رفيق السفر التفاعلي المدعوم بالذكاء الاصطناعي، يجمع بين عظمة الحضارة المصرية القديمة وأحدثเทคโนโลยี الذكاء الاصطناعي التوليدي لتصميم رحلات فريدة ومخصصة لكل مسافر.'
        : 'Rahal is your AI-powered travel companion, seamlessly blending 5,000 years of Egyptian heritage with state-of-the-art artificial intelligence to craft bespoke, unforgettable journeys.',
      primaryCta: isAr ? 'ابدأ التخطيط الآن' : 'Start Planning',
      secondaryCta: isAr ? 'استكشف الفنادق' : 'Explore Stays',
    },
    stats: [
      { number: '10,000+', label: isAr ? 'مسافر مستكشف' : 'Modern Explorers', icon: <Users className="w-5 h-5 text-primary" /> },
      { number: '500+', label: isAr ? 'معلم تاريخي وثقافي' : 'Heritage Landmarks', icon: <History className="w-5 h-5 text-primary" /> },
      { number: '1,200+', label: isAr ? 'فندق ومأوى فاخر' : 'Curated Sanctuaries', icon: <MapPin className="w-5 h-5 text-primary" /> },
      { number: '24/7', label: isAr ? 'دعم ذكي على مدار الساعة' : 'AI Companion Support', icon: <Cpu className="w-5 h-5 text-primary" /> },
    ],
    mission: {
      subtitle: isAr ? 'مهمتنا' : 'Our Mission',
      title: isAr ? 'حيث يلتقي التاريخ العريق بالذكاء الحديث' : 'Where Ancient Heritage Meets Modern Intelligence',
      desc1: isAr
        ? 'تأسست منصة رحّال بهدف إعادة تعريف كيفية استكشاف العالم لمصر. نحن نؤمن بأن كل رحلة إلى أرض الفراعنة يجب أن تكون مميزة وفريدة كالتاريخ نفسه.'
        : 'Rahal was founded with a single mission: to redefine how the world experiences Egypt. We believe every journey to the land of the Pharaohs should be as unique and profound as history itself.',
      desc2: isAr
        ? 'من خلال تحليل البيانات اللوجستية وتفضيلات المسافرين وتاريخ المعالم الثقافية، يقدم المحرك الذكي لرحّال توصيات دقيقة وحجوزات سلسة تضمن تجربة سفر استثنائية.'
        : 'By harnessing real-time logistics analysis, deep archival data, and personalized traveler tastes, our intelligent engine creates flawless, highly tailored travel itineraries with zero friction.',
      card1Title: isAr ? 'أصالة التراث المصري' : 'Authentic Egyptian Heritage',
      card1Desc: isAr ? 'توثيق دقيق وشامل للمعالم السياحية والتاريخية بلمسة ثقافية عريقة.' : 'Deeply researched historical archives and authentic local experiences across Egypt.',
      card2Title: isAr ? 'دقة الذكاء الاصطناعي' : 'Algorithmic Precision',
      card2Desc: isAr ? 'برامج رحلات مخصصة تولد في ثوانٍ وتتكيف مع رغباتك وميزانيتك.' : 'Hyper-personalized itineraries generated in seconds, matching your exact schedule.',
    },
    values: {
      subtitle: isAr ? 'قيمنا الجوهرية' : 'Our Core Values',
      title: isAr ? 'المبادئ التي تقود كل ابتكار نقدمه' : 'The Principles Driving Our Innovation',
      items: [
        {
          icon: <Sparkles className="w-6 h-6 text-primary" />,
          title: isAr ? 'الابتكار المستمر' : 'Relentless Innovation',
          desc: isAr ? 'نطور نموذج الذكاء الاصطناعي باستمرار لتقديم حلول سفر ذكية ومبتكرة.' : 'Constantly refining our AI models to provide cutting-edge travel recommendations.',
        },
        {
          icon: <Globe className="w-6 h-6 text-primary" />,
          title: isAr ? 'الضيافة الأصيلة' : 'Authentic Hospitality',
          desc: isAr ? 'نجمع بين كرم الضيافة المصرية والتكنولوجيا الحديثة لخدمة زوار مصر.' : 'Merging traditional Egyptian warmth with modern digital convenience for every guest.',
        },
        {
          icon: <ShieldCheck className="w-6 h-6 text-primary" />,
          title: isAr ? 'الموثوقية والأمان' : 'Trust & Security',
          desc: isAr ? 'حجوزات آمنة بنسبة 100% وشراكات مع أفضل الموردين والفنادق المعتمدة.' : 'Ensuring end-to-end encryption, verified stays, and reliable local tour guides.',
        },
        {
          icon: <Heart className="w-6 h-6 text-primary" />,
          title: isAr ? 'السفر المستدام' : 'Sustainable Tourism',
          desc: isAr ? 'دعم المجتمعات المحلية والحفاظ على التراث البيئي والأثري في مصر.' : 'Supporting local Egyptian artisans, heritage sites, and eco-conscious hoteliers.',
        },
      ],
    },
    techBanner: {
      title: isAr ? 'محرك رحّال الذكي: المستقبل بين يديك' : 'The Rahal Engine: Tomorrow’s Travel Today',
      desc: isAr
        ? 'سواء كنت تخطط لرحلة غوص في البحر الأحمر، أو جولة تاريخية بين معابد الأقصر وأسوان، يرافقك الذكاء الاصطناعي في كل خطوة.'
        : 'Whether planning a Red Sea diving expedition or a historic temple tour through Luxor and Aswan, our AI companion guides you seamlessly at every turn.',
      cta: isAr ? 'جرب المخطط الذكي' : 'Try AI Planner',
    },
    newsletter: {
      title: isAr ? 'ابقَ على اتصال برحّال' : 'Stay Connected with Rahal',
      subtitle: isAr ? 'اشترك في نشرتنا البريدية للحصول على أحدث نصائح السفر والعروض الحصرية' : 'Subscribe to our newsletter for exclusive Egypt travel guides and AI feature updates.',
      placeholder: isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email address',
      button: isAr ? 'اشترك الان' : 'Subscribe',
      success: isAr ? 'تم الاشتراك بنجاح! شكرًا لانضمامك.' : 'Successfully subscribed! Thank you for joining.',
    },
  };

  return (
    <main className="min-h-screen bg-background text-on-background pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-margin-mobile md:px-margin-desktop max-w-container mx-auto py-12 md:py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          <Badge variant="secondary" pill className="px-4 py-1.5 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 mr-1 inline" />
            {content.hero.badge}
          </Badge>

          <Heading level={1} variant="display-lg" className="text-on-background max-w-3xl">
            {content.hero.title}
          </Heading>

          <Text variant="body-lg" className="max-w-2xl text-on-surface-variant leading-relaxed">
            {content.hero.subtitle}
          </Text>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Link href="/trips" className="w-full sm:w-auto">
              <Button variant="primary" pill fullWidth className="text-base py-3.5 px-8 shadow-md">
                {content.hero.primaryCta}
              </Button>
            </Link>
            <Link href="/hotels" className="w-full sm:w-auto">
              <Button variant="secondary" pill fullWidth className="text-base py-3.5 px-8">
                {content.hero.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Banner Showcase */}
        <div className="mt-14 relative w-full h-[320px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXF5dB3BoNx74caTSpo70YiPiuES8Y9zEj62t2mLfoovW2zrkJ8vnY2xbPbV3lQgfOMpW3kdchr2tDzlFR-BjcodOoLhO9MFaWwtxbPl4-VkoGF2V9Yr8waqRQl3QZcn3lcC_rwibeL8CSa4pAiEDFLLk9k6rFIWo0IevUln0e4fSM4l2O0TFQEUWuVAhtkYl2-_XVXQ_2MYYaTFtRZ0OpClnk0Wi5NVUM_UXn-pIoP5Wd84Q-u2mtwN_2jh3Wr1FiHoH2Pn72Ak8"
            alt="Rahal About Hero - Ancient Egyptian Pyramids under twilight sky"
            fill
            priority
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 md:p-12">
            <div className="text-white max-w-xl">
              <span className="text-xs uppercase font-bold tracking-widest text-primary-fixed-dim block mb-2">
                {isAr ? 'رحّال للذكاء الاصطناعي' : 'Rahal Travel AI'}
              </span>
              <p className="font-display text-xl md:text-3xl font-semibold">
                {isAr ? 'نعيد التفكير في السفر لاستكشاف أسرار مصر القديمة' : 'Reimagining travel to unlock the timeless secrets of Egypt.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar (Reusing Card component) */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container mx-auto mb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {content.stats.map((stat, idx) => (
            <Card key={idx} hoverEffect={true} className="flex flex-col items-center text-center p-6 bg-surface-container-lowest border-outline-variant/30">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                {stat.icon}
              </div>
              <span className="font-display font-bold text-3xl md:text-4xl text-primary mb-1">
                {stat.number}
              </span>
              <Text variant="body-md" className="text-on-surface-variant font-medium text-xs md:text-sm">
                {stat.label}
              </Text>
            </Card>
          ))}
        </div>
      </section>

      {/* Our Mission & Story */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container mx-auto mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Text variant="label-md" className="text-primary font-bold tracking-widest">
              {content.mission.subtitle}
            </Text>
            <Heading level={2} variant="headline-md" className="text-on-background">
              {content.mission.title}
            </Heading>
            <Text variant="body-lg" className="text-on-surface-variant leading-relaxed">
              {content.mission.desc1}
            </Text>
            <Text variant="body-md" className="text-on-surface-variant/80 leading-relaxed">
              {content.mission.desc2}
            </Text>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Card hoverEffect={false} className="p-5 bg-surface-container-low border-outline-variant/20">
                <Heading level={3} variant="headline-sm" className="text-base text-on-surface mb-2 font-semibold">
                  {content.mission.card1Title}
                </Heading>
                <Text variant="body-md" className="text-xs md:text-sm text-on-surface-variant">
                  {content.mission.card1Desc}
                </Text>
              </Card>
              <Card hoverEffect={false} className="p-5 bg-surface-container-low border-outline-variant/20">
                <Heading level={3} variant="headline-sm" className="text-base text-on-surface mb-2 font-semibold">
                  {content.mission.card2Title}
                </Heading>
                <Text variant="body-md" className="text-xs md:text-sm text-on-surface-variant">
                  {content.mission.card2Desc}
                </Text>
              </Card>
            </div>
          </div>

          {/* Decorative Image & Experience Card */}
          <div className="relative">
            <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-card-hover border border-outline-variant/30">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXF5dB3BoNx74caTSpo70YiPiuES8Y9zEj62t2mLfoovW2zrkJ8vnY2xbPbV3lQgfOMpW3kdchr2tDzlFR-BjcodOoLhO9MFaWwtxbPl4-VkoGF2V9Yr8waqRQl3QZcn3lcC_rwibeL8CSa4pAiEDFLLk9k6rFIWo0IevUln0e4fSM4l2O0TFQEUWuVAhtkYl2-_XVXQ_2MYYaTFtRZ0OpClnk0Wi5NVUM_UXn-pIoP5Wd84Q-u2mtwN_2jh3Wr1FiHoH2Pn72Ak8"
                alt="Rahal Heritage Exploration"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating Badge Card */}
            <Card hoverEffect={false} className="absolute -bottom-6 -left-4 md:-left-6 max-w-xs bg-surface/95 backdrop-blur-md p-5 border-primary/30 shadow-2xl rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-on-surface">
                    {isAr ? 'جودة معتمدة' : 'Certified Excellence'}
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    {isAr ? 'أفضل رفيق سفر ذكي لعام 2026' : 'Premier AI Travel Solution 2026'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container mx-auto mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Text variant="label-md" className="text-primary font-bold tracking-widest">
            {content.values.subtitle}
          </Text>
          <Heading level={2} variant="headline-md" className="mt-2 text-on-background">
            {content.values.title}
          </Heading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.values.items.map((val, idx) => (
            <Card key={idx} hoverEffect={true} className="flex flex-col h-full bg-surface-container-lowest p-6 border-outline-variant/30">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                {val.icon}
              </div>
              <Heading level={3} variant="headline-sm" className="text-lg font-semibold text-on-surface mb-3">
                {val.title}
              </Heading>
              <Text variant="body-md" className="text-on-surface-variant flex-1 text-sm leading-relaxed">
                {val.desc}
              </Text>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Architecture Callout (Reusing Card double border style) */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container mx-auto mb-24">
        <div className="relative border-4 border-double border-primary bg-surface-container rounded-3xl p-8 md:p-14 overflow-hidden shadow-card-hover">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 text-primary pointer-events-none">
            <Compass className="w-[280px] h-[280px]" />
          </div>
          <div className="relative z-10 max-w-2xl flex flex-col items-start gap-6">
            <Badge variant="primary" pill className="px-3 py-1 text-xs">
              {isAr ? 'تكنولوجيا رحّال' : 'Rahal Engine'}
            </Badge>
            <Heading level={2} variant="headline-md" className="text-on-surface">
              {content.techBanner.title}
            </Heading>
            <Text variant="body-lg" className="text-on-surface-variant">
              {content.techBanner.desc}
            </Text>
            <Link href="/trips">
              <Button variant="primary" pill className="bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container shadow-md px-8 py-3">
                {content.techBanner.cta}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact & Newsletter Section (Reusing Input and Button) */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <Card hoverEffect={false} className="bg-surface-container-lowest border-outline-variant/40 p-8 md:p-12 rounded-3xl text-center max-w-3xl mx-auto shadow-card-rest">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-6 h-6 text-primary" />
          </div>
          <Heading level={2} variant="headline-md" className="text-on-surface mb-3">
            {content.newsletter.title}
          </Heading>
          <Text variant="body-md" className="text-on-surface-variant max-w-lg mx-auto mb-8">
            {content.newsletter.subtitle}
          </Text>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-success/10 text-success rounded-xl font-medium text-sm">
              <CheckCircle2 size={18} />
              <span>{content.newsletter.success}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                required
                placeholder={content.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary" pill className="whitespace-nowrap px-6 shrink-0">
                {content.newsletter.button}
              </Button>
            </form>
          )}
        </Card>
      </section>
    </main>
  );
}
