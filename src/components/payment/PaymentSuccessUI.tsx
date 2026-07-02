"use client";

import React, { useRef, useEffect } from "react";
import { ConfettiCanvas } from "./ConfettiCanvas";
import { Sparkles, MapPin, Calendar, Users, CreditCard } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useTranslations, useLocale } from "next-intl";

interface PaymentSuccessUIProps {
  // Core data
  title: string;
  subtitle: string;
  referenceId: string;
  referenceLabel: string;
  statusBadge: string;
  statusBadgeClass: string;
  
  // Summary items
  items: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
    iconClass?: string;
  }>;
  
  // Amount
  amountLabel: string;
  amountValue: string;
  
  // Actions
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction: {
    label: string;
    href: string;
  };
  
  // AI Insight
  aiInsight?: string;
  
  // Animation trigger
  isSuccess: boolean;
}

export function PaymentSuccessUI({
  title,
  subtitle,
  referenceId,
  referenceLabel,
  statusBadge,
  statusBadgeClass,
  items,
  amountLabel,
  amountValue,
  primaryAction,
  secondaryAction,
  aiInsight,
  isSuccess = true,
}: PaymentSuccessUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  // Confetti animation (same as booking success)
  useEffect(() => {
    if (!isSuccess) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];

    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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
      color: string = "";
      opacity: number = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * -canvas!.height;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.color = ["#C8922A", "#1B4B6E", "#2D7A4F", "#7e5700"][Math.floor(Math.random() * 4)];
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas!.height) {
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
    window.addEventListener("resize", resize);

    for (let i = 0; i < 40; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSuccess]);

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
          {title}
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Summary Card */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl card-shadow p-6 md:p-8 mb-10 text-left rtl:text-right">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                {referenceLabel}
              </span>
              <span className="font-display font-bold text-xl text-secondary">
                {referenceId}
              </span>
            </div>
            <div className={`bg-success/15 text-success px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadgeClass}`}>
              {statusBadge}
            </div>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                {item.icon && (
                  <div className={`p-3 rounded-full ${item.iconClass || "bg-primary/10 text-primary"} shrink-0`}>
                    {item.icon}
                  </div>
                )}
                <div>
                  <p className="text-xs text-on-surface-variant">{item.label}</p>
                  <p className="font-medium text-on-background">{item.value}</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <span className="text-xs md:text-sm font-medium text-on-background">
                {amountLabel}
              </span>
              <span className="font-display font-bold text-lg md:text-xl text-primary">
                {amountValue}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href={primaryAction.href}>
            <Button variant="primary" fullWidth className="py-3.5 rounded-xl font-bold text-sm shadow-md">
              {primaryAction.label}
            </Button>
          </Link>
          <Link href={secondaryAction.href}>
            <Button variant="secondary" fullWidth className="py-3.5 rounded-xl font-bold text-sm">
              {secondaryAction.label}
            </Button>
          </Link>
        </div>

        {/* AI Insight Chip */}
        {aiInsight && (
          <div className="mt-10 flex items-center justify-center gap-4 text-xs text-on-surface-variant">
            <Sparkles className="w-4 h-4 text-primary" />
            <p>{aiInsight}</p>
          </div>
        )}
      </div>
    </main>
  );
}