'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { THEME_STORAGE_KEY } from '@/lib/theme';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme?: string;
  resolvedTheme?: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  themes: string[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEMES: Theme[] = ['light', 'dark'];

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return 'light';
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyThemeClass(stored);
    setMounted(true);
  }, []);

  const setTheme = useCallback((value: React.SetStateAction<string>) => {
    setThemeState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (next !== 'light' && next !== 'dark') return prev;

      applyThemeClass(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: mounted ? theme : undefined,
      resolvedTheme: mounted ? theme : undefined,
      setTheme,
      themes: THEMES,
    }),
    [mounted, theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: undefined,
      resolvedTheme: undefined,
      setTheme: () => {},
      themes: THEMES,
    };
  }
  return ctx;
}
