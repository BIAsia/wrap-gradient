import React from 'react';
import { Github, ExternalLink, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC = () => {
  return (
    <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-background transition-colors duration-300">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium text-foreground">Gradient-Box</h1>
        <span className="text-xs text-muted-foreground hidden sm:inline-block">Pre-wrapped advanced gradients for production</span>
      </div>
      <nav className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1 cursor-not-allowed opacity-50">
          <span className="text-foreground">Light</span>
          <span>/</span>
          <span>Dark</span>
        </div>
        <a href="#" className="hover:text-foreground transition-colors">About</a>
        <a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors">
          Github <ExternalLink className="w-3 h-3" />
        </a>
      </nav>
    </header>
  );
};
