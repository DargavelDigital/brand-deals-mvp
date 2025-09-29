'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

/**
 * App-wide theme provider.
 * - Uses `attribute="class"` so Tailwind's `dark` variant works.
 * - `disableTransitionOnChange` avoids janky transitions on toggle.
 */
export function ThemeProvider({
  children,
  ...props
}: Omit<ThemeProviderProps, 'attribute'>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
