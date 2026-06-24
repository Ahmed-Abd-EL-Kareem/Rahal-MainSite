'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Heading from '../ui/Heading';
import Text from '../ui/Text';

export default function PopularDestinations() {
  const t = useTranslations('home.destinations');

  const destinations = [
    {
      name: t('cairo.name'),
      tag: t('cairo.tag'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRxzkCfKK05aNQ7I8BhNUuMufepxN_St7te7kUBR5Ztp6aN6SPtE53t0kaF_WZK1SAQOqbP7EvFK05JM6_EnjgkCc0F6aYqmKEhMbUBi2bV-hDwRdZRM59npgUIaTyRlJg9-JPY3vMTbZ6XSwcjPYQCLS57LpZL3AtHe5UcltYGFDyX9aAyTU4x_BlVrsBVme9tdFRWS-h7O09pV0rMtTzvMSRTuJLIypMX8YolS7oTuaQwIUOZV6rl9vpKUHPK2DMHC2jdLd5YK0",
      className: "md:col-span-8",
    },
    {
      name: t('luxor.name'),
      tag: t('luxor.tag'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQoy-6IPipWmoqHoyJNLTK4ODfs4u5CTARTU-mCQbhqeKMZ4HZqIDzqFaupoPd07VKpzJV9fNiB3o_vf5JPyUtBdpAigr6_tHFRDqTUigZ5bUvb2N1ZNZGMSNSsPqgHNZCgMPaOF0E2s6I5OUa6QdlQIDFrmfUbTPDV7Qu5PwMULSc-QMujhBgFQXCx31FAPc5RQUGh96iLo5NbntmAVs1viFXS2YMT_EJNgVEdCRbtGjlYzlJbCKAz6lfJZ0nxAMOyHtsiZLQwHQ",
      className: "md:col-span-4",
    },
    {
      name: t('aswan.name'),
      tag: t('aswan.tag'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzkG-qFKKWtOLziY5ZXQt0zM761IEraJ5yDGutuSC7jgKpDC7r_UA0bhIwRrVjUg4oL0lpNQdz4jxzt3jmi2AN-Ii0RqrdAb3GWZw6ojZaObnM8Qci5qN6oQZkQzBhW6IiLQ9K-CVoXyniq6CdSYZ6GzzWfiUaLmNXP6Xv6CobIev8M7GVc1cib3Jh-GxYIE86ARFtmKIyv3mwZUCGS3NNKTUGgCMIG85V4MRYvlCe8D8smb5sLI2XRnaoxOAbBMTyrSg_mcfT4Rc",
      className: "md:col-span-4",
    },
    {
      name: t('sharm.name'),
      tag: t('sharm.tag'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqJbazcMe-q4SE8pe6-_ZELDrgZHAOKSeI45frNZljKHvxMvEwWWfCSthkKGAPhCOx9d9kTh7YBcXnKraZJN26Vo_NOqkxl44CK3EKoMGLKKHVj9Auxq3UZtAPCKCBY9cBf4cx5McNk8oSO5LbQlCug-2S6mj9b2sHB3Ae0U1idNRtg08jB0IkSPuMYZrYn70lTkrgeBxuKAUC-rfNe0Am08W9VXLikScx7p7SnqaJcyzqT7iiDGfDSf5Khebma2m8qwZ2R1LAywM",
      className: "md:col-span-4",
    },
    {
      name: t('alexandria.name'),
      tag: t('alexandria.tag'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgRFklkHAt4Iv39XK6c6Ee6lYvj-d39ZQCTyMEuj722q8LsYce3WvvrrrN8cIW1qxQ3B63MPoPMnOTE3S87MNK_3hfub5OiGDdKff6VblYlFFoq-SpJeUcD7TGfQFzCu7Q7sL1IHxyAcpFQblDZM8NC6fQLF1UhLoEH412rCNQCdcs5-Gn5QwjQDpu0gtJ7bNzyg0qguzKA5CNetM0cIFiGhEQyvofqrs05uZYcwcGHbswywFazCOOTLhm1oKXYTz5QMOmk-QCeN4",
      className: "md:col-span-4",
    },
  ];

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <Text variant="label-md" className="text-primary font-bold tracking-widest">
              {t('subtitle')}
            </Text>
            <Heading level={2} variant="headline-md" className="mt-2 text-on-background">
              {t('title')}
            </Heading>
          </div>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-secondary font-semibold text-sm hover:underline hover:text-secondary-fixed-dim"
          >
            {t('cta')} <ArrowRight size={16} />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px] md:h-[700px]">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className={`${dest.className} col-span-12 group relative overflow-hidden rounded-xl border border-outline-variant/20 h-[300px] md:h-auto`}
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <span className="text-white font-display font-bold text-xl md:text-2xl block mb-1">
                  {dest.name}
                </span>
                <span className="text-white/80 font-body text-xs md:text-sm block">
                  {dest.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
