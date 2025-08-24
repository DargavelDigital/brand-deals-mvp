'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled via cookie or system preference
    const darkCookie = document.cookie.includes('theme=dark');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkCookie || systemPrefersDark);
    
    // Apply theme to document
    if (darkCookie || systemPrefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Set/remove cookie
    if (newDarkMode) {
      document.cookie = 'theme=dark; path=/; max-age=31536000'; // 1 year
      document.documentElement.classList.add('dark');
    } else {
      document.cookie = 'theme=light; path=/; max-age=31536000'; // 1 year
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <h2 className="text-xl font-semibold text-fg mb-4">Theme Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div>
            <h3 className="font-medium text-fg">Theme Mode</h3>
            <p className="text-sm text-muted-fg">
              {isDarkMode 
                ? 'Dark Theme - Professional, focused interface' 
                : 'Light Theme - Clean, modern interface'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode 
                ? 'bg-brand-600/20 text-brand-600' 
                : 'bg-brand-500/20 text-brand-500'
            }`}>
              {isDarkMode ? 'DARK' : 'LIGHT'}
            </div>
            
            <button
              onClick={toggleTheme}
              className="px-4 py-2 font-medium rounded-lg transition-colors bg-brand-600 hover:bg-brand-500 text-white"
            >
              {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>

        <div className="p-4 bg-muted/20 rounded-lg">
          <h4 className="font-medium text-fg mb-2">Current Theme Features:</h4>
          <ul className="text-sm text-muted-fg space-y-1">
            {isDarkMode ? (
              <>
                <li>• Deep, professional color scheme</li>
                <li>• High contrast for focused work</li>
                <li>• Reduced eye strain in low light</li>
                <li>• Modern dark interface design</li>
              </>
            ) : (
              <>
                <li>• Clean, light color palette</li>
                <li>• Soft shadows and subtle borders</li>
                <li>• Optimized for bright environments</li>
                <li>• Modern light interface design</li>
              </>
            )}
          </ul>
        </div>

        <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-brand-600">🎨</span>
            <span className="text-sm font-medium text-fg">Light UI Refresh Pack</span>
          </div>
          <p className="text-xs text-muted-fg mt-1">
            The new light theme features a refined color palette with OKLCH colors, improved shadows, and modern design tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
