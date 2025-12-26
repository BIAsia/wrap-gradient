import React from 'react';
import { Github, ExternalLink, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

import { THEME } from '../config/theme';

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className={`flex ${THEME.layout.headerHeight} items-center justify-between px-4 bg-background ${THEME.animation.transition} ${THEME.animation.duration}`}>
      <div className="flex items-center gap-2">
        <h1 className={`text-sm font-medium ${THEME.typography.color.primary}`}>Gradient-Box</h1>
        <span className={`${THEME.typography.size.xs} ${THEME.typography.color.secondary} hidden sm:inline-block`}>Pre-wrapped advanced gradients for production</span>
      </div>
      <nav className={`flex items-center gap-6 text-sm ${THEME.typography.color.secondary}`}>
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-2 hover:${THEME.typography.color.primary} ${THEME.animation.transition} p-1 rounded-md hover:bg-muted`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>
        <a href="#" className={`hover:${THEME.typography.color.primary} ${THEME.animation.transition}`}>About</a>
        <a href="#" className={`flex items-center gap-1 hover:${THEME.typography.color.primary} ${THEME.animation.transition}`}>
          Github <ExternalLink className="w-3 h-3" />
        </a>
      </nav>
    </header>
  );
};
