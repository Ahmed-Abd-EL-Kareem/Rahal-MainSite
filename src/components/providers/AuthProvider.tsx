"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { usersApi } from "@/lib/api/users";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user?: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to extract locale from pathname (e.g., "/en/login" -> "en")
const getLocaleFromPathname = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (segments[0] === "en" || segments[0] === "ar")) {
    return segments[0];
  }
  return "en"; // default
};

const authPaths = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

const isAuthPath = (pathname: string): boolean => {
  const locale = getLocaleFromPathname(pathname);
  return authPaths.some(
    (path) => pathname === `/${locale}${path}` || pathname === path
  );
};

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we should use Secure flag (HTTPS)
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const cookieSecureFlag = isSecure ? "; Secure" : "";

  const getCookieOptions = useCallback(
    (maxAge: number) => `path=/; max-age=${maxAge}; SameSite=Lax${cookieSecureFlag}`,
    [cookieSecureFlag]
  );

  const checkAuth = useCallback(async () => {
    let token: string | null = null;

    // 1. Check if token is in URL query parameters (e.g. from Google OAuth redirect)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get("token");

      if (queryToken) {
        token = queryToken;
        // Save token to non-HttpOnly cookie for client and API requests
        document.cookie = `auth_token=${token}; ${getCookieOptions(86400 * 7)}`;

        // Remove token from query parameters without reloading the page
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("token");
        window.history.replaceState(
          {},
          document.title,
          newUrl.pathname + (newUrl.search ? newUrl.search : "") + newUrl.hash
        );
      }
    }

    // 2. If no token in URL, check document.cookie
    if (!token && typeof document !== "undefined") {
      const tokenMatch = document.cookie.match(/(^|;\s*)auth_token\s*=\s*([^;]*)/);
      token = tokenMatch ? tokenMatch[2] : null;
    }

    if (token) {
      const payload = decodeToken(token);

      if (payload) {
        const userId = payload.id || payload._id || payload.sub || "";
        const email = payload.email || "";
        const name = payload.name || payload.email || "";
        const avatar = payload.picture || payload.avatar;

        setUser({
          id: userId,
          email,
          name,
          avatar,
        });

        // Fetch fresh user details to populate full profile
        if (userId) {
          try {
            const userRes = await usersApi.getUser(userId);
            if (userRes?.data?.user) {
              const u = userRes.data.user;
              setUser({
                id: u._id,
                email: u.email || "",
                name: u.name || "",
                avatar: u.image,
              });
            }
          } catch {
            // Keep parsed user state
          }
        }
      } else {
        // Token is invalid or expired
        document.cookie = `auth_token=; ${getCookieOptions(0)}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [getCookieOptions]);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [checkAuth]);

  const login = async (token: string, userData?: User) => {
    return new Promise<void>(async (resolve) => {
      document.cookie = `auth_token=${token}; ${getCookieOptions(86400 * 7)}`;

      if (userData) {
        setUser(userData);
      } else {
        const payload = decodeToken(token);
        if (payload) {
          const userId = payload.id || payload._id || payload.sub || "";
          setUser({
            id: userId,
            email: payload.email || "",
            name: payload.name || payload.email || "",
            avatar: payload.picture || payload.avatar,
          });

          if (userId) {
            try {
              const userRes = await usersApi.getUser(userId);
              if (userRes?.data?.user) {
                const u = userRes.data.user;
                setUser({
                  id: u._id,
                  email: u.email || "",
                  name: u.name || "",
                  avatar: u.image,
                });
              }
            } catch {}
          }
        }
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("auth-change"));
        resolve();
      }, 0);
    });
  };

  const logout = () => {
    // Clear both cookies
    document.cookie = `auth_token=; ${getCookieOptions(0)}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    document.cookie = `token=; ${getCookieOptions(0)}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const isAuthenticated = !!user;

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isAuthPath(pathname)) {
        const locale = getLocaleFromPathname(pathname);
        router.push(`/${locale}`);
        router.refresh();
      }
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
