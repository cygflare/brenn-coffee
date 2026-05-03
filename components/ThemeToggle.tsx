'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render a placeholder during SSR/hydration to avoid layout shift + mismatch
  if (!mounted) {
    return (
      <div
        aria-hidden
        className={`w-9 h-9 rounded-full border border-bone-200/15 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`w-9 h-9 rounded-full border border-bone-200/15 flex items-center justify-center text-bone-200 hover:border-ember hover:text-ember transition-colors ${className}`}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
