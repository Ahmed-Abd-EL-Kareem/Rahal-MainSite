/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Globe,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Hotel,
  MapPinHouse,
  Bookmark,
  LayoutDashboard,
  Heart,
  CreditCard,
  Settings,
  Shield,
} from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { usersApi } from "@/lib/api/users";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Header() {
  const t = useTranslations("common.nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const reducedMotion = useReducedMotion();

  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/en/login",
    "/en/signup",
    "/en/forgot-password",
    "/en/reset-password",
    "/en/verify-otp",
    "/ar/login",
    "/ar/signup",
    "/ar/forgot-password",
    "/ar/reset-password",
    "/ar/verify-otp",
  ].some((p) => pathname === p || pathname.startsWith(p + "/"));

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "pro" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const tabletMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      document.cookie = `token=${tokenFromUrl}; path=/; max-age=86400; SameSite=Lax`;
      params.delete("token");
      const cleanUrl =
        window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", cleanUrl);
    }
    const checkAuth = () => {
      const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const payload = token.split(".")[1];
          const decoded = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
          );
          setUserId(decoded.id || decoded._id || decoded.sub || null);
        } catch {
          setUserId(null);
        }
      } else {
        setUserId(null);
      }
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, [pathname]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  const { data: userData } = useQuery({
    queryKey: ["currentUser", userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ["mySubscription", userId],
    queryFn: () => subscriptionsApi.getMySubscription(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const currentUser = userData?.data?.user || null;
  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "U";
  const userImage = currentUser?.image;

  useEffect(() => {
    setImageError(false);
  }, [userImage]);

  useEffect(() => {
    if (subscriptionData?.data) {
      const status = subscriptionData.data.status;
      setSubscriptionTier(status === "active" || status === "succeeded" ? "pro" : "free");
    } else {
      setSubscriptionTier("free");
    }
  }, [subscriptionData]);

  if (isAuthPage) return null;

  const isAr = locale === "ar";
  const isDark = mounted && resolvedTheme === "dark";
  const isHomepage = pathname === "/";

  const isTransparent = isHomepage && !isScrolled;
  const isFloating = isScrolled;
  const isFilledFullWidth = !isHomepage && !isScrolled;

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=315313536000`;
    window.location.reload();
  };

  const handleLogout = () => {
    document.cookie =
      "token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    setIsLoggedIn(false);
    setUserId(null);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/";
  };

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const navLinks: NavLink[] = [
    { href: "/", label: t("home"), icon: <LayoutDashboard size={20} /> },
    { href: "/destinations", label: t("destinations"), icon: <MapPinHouse size={20} /> },
    { href: "/hotels", label: t("hotels"), icon: <Hotel size={20} /> },
    ...(isLoggedIn
      ? [
          { href: "/trips", label: t("trips"), icon: <CreditCard size={20} /> },
          { href: "/bookings", label: t("bookings"), icon: <Bookmark size={20} /> },
        ]
      : []),
    { href: "/pricing", label: t("pricing"), icon: <Shield size={20} /> },
    { href: "/about", label: t("about"), icon: <Settings size={20} /> },
  ];

  if (!mounted) {
    return (
      <nav
        className={cn(
          "fixed z-50 transition-all duration-500 ease-in-out flex items-center justify-between",
          isFloating
            ? "top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-[1200px] h-16 px-4 sm:px-6 bg-surface/80 backdrop-blur-md border border-outline-variant/15 shadow-lg shadow-primary/5 rounded-full"
            : isFilledFullWidth
            ? "top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-surface/85 backdrop-blur-md border-b border-outline-variant/15 shadow-sm"
            : "top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-transparent border-b border-transparent",
        )}
      >
        <div className="flex items-center gap-6 sm:gap-12">
          <Link
            href="/"
            className="flex items-center gap-2 group hover:scale-[1.02] transition-transform duration-300"
            aria-label="Rahal Home"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <span className="font-display font-bold text-xl text-primary">
                {isAr ? "رحّال" : "Rahal"}
              </span>
            </div>
          </Link>
        </div>
      </nav>
    );
  }

  const logoSrc = isTransparent
    ? "/images/logo-2.png"
    : isDark
    ? "/images/logo-2.png"
    : "/images/logo.png";

  const springTransition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 40 };
  const springTransitionStagger = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <nav
      className={cn(
        "fixed z-50 transition-all duration-500 ease-in-out flex items-center justify-between",
        isFloating
          ? "top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-[1200px] h-16 px-4 sm:px-6 bg-surface/90 backdrop-blur-md border border-outline-variant/20 shadow-xl shadow-primary/10 rounded-full"
          : isFilledFullWidth
          ? "top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-surface/95 backdrop-blur-md border-b border-outline-variant/20 shadow-sm"
          : "top-0 left-0 w-full h-20 px-margin-mobile md:px-margin-desktop bg-transparent border-b border-transparent",
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-6 lg:gap-12 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 group hover:scale-[1.02] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg shrink-0"
          aria-label="Rahal Home"
        >
          <Image
            src={logoSrc}
            alt=""
            width={isFloating ? 32 : 40}
            height={isFloating ? 32 : 40}
            className="object-contain transition-all duration-500 group-hover:rotate-12"
            priority
            aria-hidden="true"
          />
          <span
            className={cn(
              "font-display font-bold text-lg md:text-xl transition-all duration-300 whitespace-nowrap",
              isTransparent ? "text-white" : "text-on-background",
            )}
          >
            {locale === "ar" ? "رحّال" : "Rahal"}
          </span>
        </Link>

        <div
          className="hidden lg:flex items-center gap-0.5 xl:gap-1"
          role="menubar"
        >
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                className="relative py-3 px-3 xl:px-4 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl flex items-center gap-2"
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300 relative z-10 whitespace-nowrap shrink-0",
                    isTransparent
                      ? isActive
                        ? "text-primary-fixed-dim"
                        : "text-white/90 group-hover:text-primary-fixed-dim"
                      : isActive
                      ? "text-primary font-semibold"
                      : "text-on-surface-variant group-hover:text-primary",
                  )}
                >
                  {link.label}
                </span>
                <span
                  className={cn(
                    "absolute bottom-2 inset-x-2 h-[2px] transition-transform duration-300 origin-center rounded-full",
                    isTransparent ? "bg-primary-fixed-dim" : "bg-primary",
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
        <div className="relative">
          <button
            onClick={toggleLocale}
            className={cn(
              "group/lang flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-300 cursor-pointer border isolate",
              isTransparent
                ? "border-white/20 bg-white/10 text-white/90 hover:bg-white/20 hover:border-primary-fixed-dim"
                : "border-outline-variant/30 bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container hover:border-primary/30",
            )}
            aria-label={isAr ? "Switch to English" : "تحويل للغة العربية"}
          >
            <span className="flex w-3.5 h-3.5 items-center justify-center shrink-0">
              <Globe
                size={14}
                className="transition-transform duration-500 ease-out group-hover/lang:rotate-180"
                aria-hidden="true"
              />
            </span>
            <span className="uppercase tracking-wider">
              {isAr ? "EN" : "AR"}
            </span>
            <span className="flex w-3 h-3 items-center justify-center shrink-0">
              <ChevronDown
                size={12}
                className="transition-transform duration-300 ease-out group-hover/lang:rotate-180"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>

        <ThemeToggle
          className={cn(
            "transition-colors duration-300 shrink-0",
            isTransparent
              ? "text-white/90 hover:text-white hover:bg-white/10"
              : "",
          )}
        />

        {!isLoggedIn ? (
          <>
            <Link
              href="/login"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl shrink-0"
            >
              <Button
                variant="ghost"
                className={cn(
                  "px-4 xl:px-5 py-2.5 text-sm whitespace-nowrap transition-colors duration-300",
                  isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-on-surface hover:bg-surface-container",
                )}
              >
                {t("login")}
              </Button>
            </Link>
            <Link
              href="/signup"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl shrink-0"
            >
              <Button
                variant="primary"
                pill
                className={cn(
                  "text-sm px-5 xl:px-6 py-2.5 whitespace-nowrap hover:scale-[1.02] transition-transform duration-300 shadow-md hover:shadow-primary/30",
                  isTransparent
                    ? "bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim"
                    : "",
                )}
              >
                {t("signup")}
              </Button>
            </Link>
          </>
        ) : (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-high/50 transition-colors duration-200 cursor-pointer isolate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={t("profile")}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
            >
              {userImage && !imageError ? (
                <img
                  src={userImage}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-primary-fixed-dim/30 shadow-sm shrink-0"
                  onError={() => setImageError(true)}
                  aria-hidden="true"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold font-display shrink-0">
                  {userInitial}
                </div>
              )}
              <span className="flex w-3.5 h-3.5 items-center justify-center shrink-0">
                <ChevronDown
                  size={14}
                  className="transition-transform duration-300 ease-out"
                  style={{
                    transform: isDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                  aria-hidden="true"
                />
              </span>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  onClick={() => setIsDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  className={cn(
                    "absolute mt-2.5 w-56 bg-surface border border-outline-variant/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 z-50 animate-fade-in text-on-surface text-start",
                    isAr
                      ? "inset-inline-start-0 origin-top-start left-0"
                      : "inset-inline-end-0 origin-top-end right-0",
                  )}
                >
                  <div className="px-3 py-2.5 border-b border-outline-variant/10 mb-1.5">
                    <p className="text-xs font-bold text-on-surface truncate">
                      {currentUser?.name || "Explorer"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {currentUser?.email || ""}
                    </p>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      isAr ? "flex-row-reverse" : "",
                    )}
                  >
                    <User
                      size={16}
                      className="shrink-0 text-on-surface-variant/60"
                      aria-hidden="true"
                    />
                    <span>{t("profile")}</span>
                  </Link>

                  <Link
                    href="/favorites"
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      isAr ? "flex-row-reverse" : "",
                    )}
                  >
                    <Hotel
                      size={16}
                      className="shrink-0 text-on-surface-variant/60"
                      aria-hidden="true"
                    />
                    <span>{t("favorites")}</span>
                  </Link>

                  <Link
                    href="/favorites/destinations"
                    onClick={() => setIsDropdownOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      locale === "ar" ? "flex-row-reverse" : "",
                    )}
                  >
                    <MapPinHouse
                      size={16}
                      className="shrink-0 text-on-surface-variant/60"
                      aria-hidden="true"
                    />
                    <span>{t("favoriteDestinations")}</span>
                  </Link>

                  <Link
                    href="/bookings"
                    onClick={() => setIsDropdownOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer",
                      locale === "ar" ? "flex-row-reverse" : "",
                    )}
                  >
                    <Bookmark
                      size={16}
                      className="shrink-0 text-on-surface-variant/60"
                      aria-hidden="true"
                    />
                    <span>{t("bookings")}</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    role="menuitem"
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-error hover:bg-error/5 rounded-xl transition-colors cursor-pointer border-none bg-transparent",
                      isAr ? "flex-row-reverse" : "",
                    )}
                  >
                    <LogOut size={16} className="shrink-0" aria-hidden="true" />
                    <span>{t("logout")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex lg:hidden items-center gap-1 sm:gap-2 shrink-0">
        <ThemeToggle
          className={cn(
            "transition-colors duration-300",
            isTransparent
              ? "text-white/90 hover:text-white hover:bg-white/10"
              : "",
          )}
        />
        <button
          onClick={toggleLocale}
          className={cn(
            "px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors duration-300 rounded-full border",
            isTransparent
              ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
              : "border-outline-variant/30 bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container",
          )}
          aria-label={isAr ? "Switch to English" : "تحويل للغة العربية"}
        >
          {isAr ? "EN" : "AR"}
        </button>
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "p-2 cursor-pointer transition-colors duration-300 rounded-full",
            isTransparent
              ? "text-white hover:bg-white/10"
              : "text-on-surface-variant hover:bg-surface-container",
          )}
          aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          whileTap={{ scale: 0.9 }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeMobileMenu}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            />
            <motion.div
              className={cn(
                "absolute inset-inline-start-0 w-full flex flex-col max-h-[calc(100vh-6rem)] overflow-y-auto",
                isFloating
                  ? "top-18 left-0 right-0 mx-4 bg-surface/95 backdrop-blur-md border border-outline-variant/20 shadow-2xl rounded-3xl"
                  : "top-20 left-0 bg-surface border-b border-outline-variant/20 shadow-lg",
              )}
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.98 }}
              transition={springTransition}
            >
              <div className="flex items-center justify-between p-4 border-b border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="font-display font-bold text-xl text-primary">
                      {isAr ? "رحّال" : "Rahal"}
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full hover:bg-surface-container transition-colors"
                  aria-label={t("closeMenu")}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <X size={24} className="text-on-surface-variant" />
                </motion.button>
              </div>

              <div className="flex flex-col gap-1 p-4">
                {navLinks.map((link, index) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: isAr ? 20 : -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: isAr ? 20 : -20, opacity: 0 }}
                      transition={{
                        delay: reducedMotion ? 0 : index * 0.04,
                        ...springTransitionStagger,
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors duration-200",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-on-surface hover:bg-surface-container hover:text-primary",
                        )}
                        style={{ touchAction: "manipulation" }}
                      >
                        <span className="shrink-0 text-on-surface-variant/60" aria-hidden="true">
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-outline-variant/10">
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="w-full"
                    >
                      <Button
                        variant="ghost"
                        fullWidth
                        className="text-on-surface py-3.5 rounded-xl font-semibold"
                      >
                        {t("login")}
                      </Button>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobileMenu}
                      className="w-full"
                    >
                      <Button
                        variant="primary"
                        pill
                        fullWidth
                        className="py-3.5 rounded-xl font-semibold"
                      >
                        {t("signup")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/10 text-start",
                        isAr ? "flex-row-reverse" : "",
                      )}
                    >
                      {userImage && !imageError ? (
                        <img
                          src={userImage}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border border-primary/20"
                          onError={() => setImageError(true)}
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-bold font-display shrink-0">
                          {userInitial}
                        </div>
                      )}
                      <div className="truncate flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {currentUser?.name || "Explorer"}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {currentUser?.email || ""}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              subscriptionTier === "pro"
                                ? "bg-primary/10 text-primary"
                                : "bg-surface-container-high text-on-surface-variant",
                            )}
                          >
                            {subscriptionTier === "pro" ? "Pro" : "Free"}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className="w-full"
                    >
                      <Button
                        variant="secondary"
                        fullWidth
                        className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <User size={18} aria-hidden="true" />
                        <span>{t("profile")}</span>
                      </Button>
                    </Link>

                    <Link
                      href="/favorites"
                      onClick={closeMobileMenu}
                      className="w-full"
                    >
                      <Button
                        variant="secondary"
                        fullWidth
                        className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Heart size={18} aria-hidden="true" />
                        <span>{t("favorites")}</span>
                      </Button>
                    </Link>

                    <Link
                      href="/favorites/destinations"
                      onClick={closeMobileMenu}
                      className="w-full"
                    >
                      <Button
                        variant="secondary"
                        fullWidth
                        className="py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <MapPinHouse size={18} aria-hidden="true" />
                        <span>{t("favoriteDestinations")}</span>
                      </Button>
                    </Link>

                    <Link
                      href="/bookings"
                      onClick={closeMobileMenu}
                      className="w-full"
                    >
                      <Button
                        variant="secondary"
                        fullWidth
                        className="py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Bookmark size={18} aria-hidden="true" />
                        <span>{t("bookings")}</span>
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        closeMobileMenu();
                        handleLogout();
                      }}
                      className="text-error hover:bg-error/5 py-2.5 rounded-xl font-semibold border-none bg-transparent flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} aria-hidden="true" />
                      <span>{t("logout")}</span>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}