'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * Toggles the `.dark` class on <html> and remembers the choice in
 * localStorage under `theme` ('light' | 'dark'). The initial class is set
 * synchronously by an inline script in the root layout (see app/layout.tsx)
 * so there's no flash of the wrong theme on load; this component just keeps
 * itself in sync with that state and lets the user flip it.
 */
export default function ThemeToggle({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // localStorage unavailable (e.g. private browsing) — theme just won't persist.
    }
  }

  const sidebarClasses =
    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white/70 hover:bg-white/5 hover:text-white';
  const defaultClasses =
    'flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-muted transition-colors hover:text-ink';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={variant === 'sidebar' ? sidebarClasses : defaultClasses}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      {variant === 'sidebar' && (isDark ? 'Light mode' : 'Dark mode')}
    </button>
  );
}
