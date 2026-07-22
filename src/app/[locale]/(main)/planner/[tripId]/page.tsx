"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import { Loader2 } from "lucide-react";

export default function TripItineraryPage() {
  const t = useTranslations("planner.itinerary");
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-container px-margin-mobile py-32 md:px-margin-desktop">
      <Heading level={1} variant="headline-md" className="text-on-surface">
        {t("title")}
      </Heading>
      <Text variant="body-md" className="mt-4 text-on-surface-variant">
        {t("comingSoon")}
      </Text>
    </main>
  );
}
