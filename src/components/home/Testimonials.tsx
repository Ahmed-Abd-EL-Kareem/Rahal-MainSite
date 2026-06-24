'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import Heading from '../ui/Heading';
import Text from '../ui/Text';
import Card from '../ui/Card';

export default function Testimonials() {
  const t = useTranslations('home.testimonials');

  const testimonials = [
    {
      quote: t('t1.quote'),
      author: t('t1.author'),
      loc: t('t1.loc'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDo_qkHPa458am4QOLefsMtnka0ToPBchz2sE2pFMn81oFNi4H-f1SOFmx0umLi9npzWSpWAb6Ioy-ejelaaN7ptlaiGfK62X-Sob6qf_qLlxZjgpEElGCytFvhTsI3l4Cgy_jLBrl-TIgSak9VgUofHu5xoBhJK6kXNQKfSxcLzVQmzV7IrOd-z81j1RItF43vwhtvQzc8zktiP5FJ5Sm3lvVIDoSjaZCpy30IVDTymphwW74egnEN_o-cu-0nrC_cwBCJ5aZliEU",
    },
    {
      quote: t('t2.quote'),
      author: t('t2.author'),
      loc: t('t2.loc'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaz3285s218AdZ2OA34hDeKlex2udp92Nwtm0_6V8YKqisXrmkBYjMbXQjyqIohHF2DlVX2AIxT9a8BCCze-AfYu1_iAeJcuXa5KWAF-TxLDRCXjxlmWJ_hoe8v9jjmLeOQJLtHEuQymwTLm1w86tuDAR7OAuXJMea63k4IeMmXHpWu8Gsu0dyAZtSmxsfUvq7_bzrE0aKlF-Bd4bXCw0G_kKn7NcdcrLJaCaJbhbkZ3yamwiOgGSBFD7FTYCGinv6mYnBL0nIFQI",
    },
    {
      quote: t('t3.quote'),
      author: t('t3.author'),
      loc: t('t3.loc'),
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD89YR23F_V8z4uRusr92nIuDELROM3qDiC2xCDLFI7YFk6oZj9C58odZdPUdSOASUgdUvInq7G2FFyRq8Qq6BRDhEUhluU_5NrASs7d_npmrHqGVOduO91-h7l0Yzt_qsa5HH2cyDbLUbxhi--jyS2ohj0GMOFTFhtKgIRIO962wReatPMLomn8Znxi7j1SpI_nJ-7SQIDXEO2JgbVqT4qU3eqw3atv1yyp1MybBJJlFEdUCVYLzxogyKI_QoLvqKh-Q1Emgq-zmc",
    },
  ];

  return (
    <section className="py-24 bg-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <Heading level={2} variant="headline-md" className="text-center mb-16">
          {t('title')}
        </Heading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter">
          {testimonials.map((test, idx) => (
            <Card key={idx} className="bg-surface-container-lowest p-8 flex flex-col justify-between shadow-card-rest hover:shadow-card-hover border border-outline-variant/30 italic">
              <div>
                {/* 5 Stars */}
                <div className="flex text-primary mb-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-primary text-primary" />
                  ))}
                </div>
                <Text variant="body-md" className="text-on-surface mb-6 leading-relaxed">
                  {test.quote}
                </Text>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 not-italic mt-auto pt-4 border-t border-outline-variant/20">
                <div className="w-12 h-12 rounded-full overflow-hidden relative border border-outline-variant/30 flex-shrink-0">
                  <Image
                    src={test.image}
                    alt={test.author}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm md:text-base text-on-surface">{test.author}</div>
                  <div className="text-xs text-on-surface-variant font-medium">{test.loc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
