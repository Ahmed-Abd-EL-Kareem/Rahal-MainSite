'use client';

import React, { useEffect, useState, use, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles, AlertCircle, Clock, MapPin } from "lucide-react";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Use any for subscription data since backend response may vary
type SubscriptionData = any;

export default function SubscriptionSuccessPage({ params }: PageProps) {
  const { locale } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("account");

  const sessionId = searchParams.get("session_id") || "";
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("processing");
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 20;

  const isAr = locale === "ar";

  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle Canvas Confetti Effect (only used in succeeded state)
  useEffect(() => {
    if (paymentStatus !== "active" && paymentStatus !== "succeeded") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeCanvas = canvas;
    const ctx = activeCanvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];

    const resize = () => {
      if (activeCanvas) {
        activeCanvas.width = window.innerWidth;
        activeCanvas.height = window.innerHeight;
      }
    };

    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedY: number = 0;
      speedX: number = 0;
      rotation: number = 0;
      rotationSpeed: number = 0;
      color: string = '';
      opacity: number = 0;

      constructor() {
        this.reset();
        this.y = Math.random() * activeCanvas.height;
      }

      reset() {
        this.x = Math.random() * activeCanvas.width;
        this.y = Math.random() * -activeCanvas.height;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.color = ['#C8922A', '#1B4B6E', '#2D7A4F', '#7e5700'][Math.floor(Math.random() * 4)];
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > activeCanvas.height) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [paymentStatus]);

  // Fetch user's current subscription (works after Stripe payment completes)
  const fetchSubscription = async () => {
    try {
      const response = await subscriptionsApi.getMySubscription();
      const data = response.data;
      
      if (data) {
        setSubscription(data);
        // Use status from Subscription type, fallback to 'active' if not pending/canceled
        const status = data.status || "active";
        setPaymentStatus(status);
        setIsLoading(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    
    const initialFetch = async () => {
      const found = await fetchSubscription();
      if (mounted && !found) {
        // If no subscription yet, start polling
        setIsLoading(false);
      }
    };
    
    initialFetch();
    
    return () => { mounted = false; };
  }, []);

  // Poll for subscription if still pending/processing
  useEffect(() => {
    // Consider "pending", "processing", "past_due" as states that need polling
    const isPendingStatus = paymentStatus === "pending" || paymentStatus === "processing" || paymentStatus === "past_due";
    if (isPendingStatus) {
      if (attempts >= maxAttempts) {
        return;
      }

      const interval = setInterval(async () => {
        const found = await fetchSubscription();
        if (found && !isPendingStatus) {
          return;
        }
        setAttempts(prev => prev + 1);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [paymentStatus, attempts]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr || "";
    }
  };

  const formatPrice = (price?: number, currencyCode?: string) => {
    if (price === undefined) return "";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode || "USD",
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${currencyCode || "$"} ${price}`;
    }
  };

  const handleRetryPayment = async () => {
    router.push(`/${locale}/pricing`);
  };

  // Determine UI state based on subscription status
  const isSuccess = paymentStatus === "active";
  const isCancelled = paymentStatus === "canceled" || paymentStatus === "cancelled" || paymentStatus === "free";
  const isFailed = paymentStatus === "failed" || paymentStatus === "past_due";
  const isPending = paymentStatus === "pending" || paymentStatus === "processing";

  // 1. Loading/Verifying State
  if (isLoading || isPending) {
    return (
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile relative overflow-hidden bg-background text-on-background min-h-screen">
        <div className="max-w-xl w-full flex flex-col items-center text-center z-10 px-4 py-16">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h1 className="font-display font-bold text-2xl md:text-3xl text-on-background mb-4">
            {t("subscriptionSuccess.loadingTitle")}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {t("subscriptionSuccess.loadingSubtitle")}
          </p>
          {attempts > 0 && (
            <p className="text-xs text-on-surface-variant/60 mt-4">
              {t("subscriptionSuccess.verifyingAttempt", { attempt: attempts, maxAttempts })}
            </p>
          )}
        </div>
      </main>
    );
  }

  // Error state - subscription not found after max attempts
  if (isError || !subscription || attempts >= maxAttempts) {
    return (
      <main className="container mx-auto px-margin-mobile py-32 flex flex-col items-center justify-center min-h-[60vh] z-10 text-center">
        <div className="bg-error/10 p-4 rounded-full text-error mb-4">
          <AlertCircle size={32} />
        </div>
        <p className="text-error font-semibold mb-6">
          {attempts >= maxAttempts 
            ? t("subscriptionSuccess.verificationTimeout") 
            : t("subscriptionSuccess.errorTitle")}
        </p>
        <Link href={`/${locale}/account?tab=subscription`}>
          <Button variant="primary">{t("subscriptionSuccess.goToAccount")}</Button>
        </Link>
      </main>
    );
  }

  // 2. Failed/Cancelled State
  if (isCancelled || isFailed) {
    return (
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile relative overflow-hidden bg-background text-on-background min-h-screen">
        <div className="max-w-xl w-full flex flex-col items-center text-center z-10 px-4 py-16">
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-error/10 rounded-full scale-125 animate-pulse"></div>
            <svg className="w-24 h-24 text-error" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-on-background mb-4">
            {t("subscriptionSuccess.failedTitle")}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
            {t("subscriptionSuccess.failedSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button
              variant="primary"
              onClick={handleRetryPayment}
              className="px-8 py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              {t("subscriptionSuccess.retryPayment")}
            </Button>
            <Link href={`/${locale}/account/subscription`}>
              <Button variant="secondary" className="px-8 py-3.5 rounded-xl font-bold text-sm w-full">
                {t("subscriptionSuccess.goToAccount")}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Pending state
  if (isPending) {
    return (
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile relative overflow-hidden bg-background text-on-background min-h-screen">
        <div className="max-w-xl w-full flex flex-col items-center text-center z-10 px-4 py-16">
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-amber-500/10 rounded-full scale-125 animate-pulse"></div>
            <Clock className="w-16 h-16 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-on-background mb-4">
            {t("subscriptionSuccess.pendingTitle")}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
            {t("subscriptionSuccess.pendingSubtitle")}
          </p>
        </div>
      </main>
    );
  }

  // 4. Success state
  return (
    <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-margin-mobile relative overflow-hidden bg-background text-on-background min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawCheck {
            0% { stroke-dashoffset: 48; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 1; }
        }
        .check-animate {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: drawCheck 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            animation-delay: 0.2s;
        }
        .card-shadow {
            box-shadow: 0 12px 24px -4px rgba(200, 146, 42, 0.12);
        }
        .dark .card-shadow {
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }
      `}} />

      {/* Confetti Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      <div className="max-w-xl w-full flex flex-col items-center text-center z-10 px-4">
        {/* Animated Success Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-success/10 rounded-full scale-125 animate-pulse"></div>
          <svg className="w-24 h-24 text-success" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
            <path className="check-animate" d="M20 6L9 17L4 12"></path>
          </svg>
        </div>

        <h1 className="font-display font-bold text-3xl md:text-4xl text-on-background mb-4">
          {t("subscriptionSuccess.successTitle")}
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
          {t("subscriptionSuccess.successSubtitle")}
        </p>

        {/* Subscription Summary Card */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl card-shadow p-6 md:p-8 mb-10 text-left rtl:text-right">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                {t("subscriptionSuccess.subscriptionReference")}
              </span>
              <span className="font-display font-bold text-xl text-secondary">
                SUB-{subscription?.id?.slice(-6).toUpperCase() || "PRO"}
              </span>
            </div>
            <div className="bg-success/15 text-success px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {t("subscriptionSuccess.active")}
            </div>
          </div>

          {/* Subscription plan visual card */}
          <div className="flex gap-4 items-center mb-6 p-4 bg-background rounded-lg border border-outline-variant/20">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/20 relative">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10a7 7 0 1114 0" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-50" />
            </div>
            <div className="text-left rtl:text-right leading-tight flex-1">
              <h3 className="font-display font-bold text-lg text-on-background">
                {subscription?.planName || t("subscriptionSuccess.travelerPro")}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {t("subscriptionSuccess.subscriptionPlan")}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant/20">
              <div className="text-left rtl:text-right">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  {t("subscriptionSuccess.billingCycle")}
                </span>
                <span className="text-xs md:text-sm font-bold text-on-surface">
                  {subscription?.billingInterval === "month" ? t("subscriptionSuccess.monthly") : t("subscriptionSuccess.yearly")}
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  {t("subscriptionSuccess.amount")}
                </span>
                <span className="text-xs md:text-sm font-bold text-on-surface">
                  {formatPrice(subscription?.amount, subscription?.currency)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant/20">
              <div className="text-left rtl:text-right">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  {t("subscriptionSuccess.startDate")}
                </span>
                <span className="text-xs md:text-sm font-bold text-on-surface">
                  {formatDate(subscription?.startDate)}
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  {t("subscriptionSuccess.nextBillingDate")}
                </span>
                <span className="text-xs md:text-sm font-bold text-on-surface">
                  {formatDate(subscription?.nextBillingDate)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs md:text-sm font-medium text-on-background">
                {t("subscriptionSuccess.totalPaid")}
              </span>
              <span className="font-display font-bold text-lg md:text-xl text-primary">
                {formatPrice(subscription?.amount, subscription?.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href={`/${locale}/account?tab=subscription`} className="flex-grow">
            <Button variant="primary" fullWidth className="py-3.5 rounded-xl font-bold text-sm shadow-md">
              {t("subscriptionSuccess.viewSubscription")}
            </Button>
          </Link>
          <Link href={`/${locale}/browse`} className="flex-grow">
            <Button variant="secondary" fullWidth className="py-3.5 rounded-xl font-bold text-sm">
              {t("subscriptionSuccess.browseExperiences")}
            </Button>
          </Link>
        </div>

        {/* AI Insight Chip */}
        <div className="mt-12 flex items-center gap-3 bg-secondary/5 px-4 py-3 rounded-full border border-secondary/15">
          <Sparkles size={16} className="text-secondary shrink-0 fill-secondary/10 animate-pulse" />
          <p className="text-xs text-secondary leading-relaxed font-semibold italic">
            "{t("subscriptionSuccess.aiInsight")}"
          </p>
        </div>
      </div>
    </main>
  );
}
