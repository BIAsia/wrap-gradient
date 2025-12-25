import React from 'react';
import { Github, ExternalLink, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

import { THEME } from '../config/theme';

export const Header: React.FC = () => {
  return (
    <header className={`flex ${THEME.layout.headerHeight} items-center justify-between px-4 border-b ${THEME.layout.border} bg-background ${THEME.animation.transition} ${THEME.animation.duration}`}>
      <div className="flex items-center gap-2">
        <h1 className={`text-sm font-medium ${THEME.typography.color.primary}`}>Gradient-Box</h1>
        <span className={`${THEME.typography.size.xs} ${THEME.typography.color.secondary} hidden sm:inline-block`}>Pre-wrapped advanced gradients for production</span>
      </div>
      <nav className={`flex items-center gap-6 text-sm ${THEME.typography.color.secondary}`}>
        <div className="flex items-center gap-1 cursor-not-allowed opacity-50">
          <span className={THEME.typography.color.primary}>Light</span>
          <span>/</span>
          <span>Dark</span>
        </div>
        <a href="#" className={`hover:${THEME.typography.color.primary} ${THEME.animation.transition}`}>About</a>
        <a href="#" className={`flex items-center gap-1 hover:${THEME.typography.color.primary} ${THEME.animation.transition}`}>
          Github <ExternalLink className="w-3 h-3" />
        </a>
      </nav>
    </header>
  );
};
