/**
 * UI Theme Configuration
 * Centralized place for layout, typography, and component styling.
 */

export const THEME = {
    layout: {
        headerHeight: 'h-12',
        padding: {
            standard: 'p-4',    // 24px
            compact: 'p-4',     // 16px
            relaxed: 'p-4',     // 32px
            mobile: 'p-4',
        },
        gap: {
            standard: 'gap-6',
            compact: 'gap-4',
            relaxed: 'gap-8',
        },
        border: 'border-border',
        divide: 'divide-border',
    },

    typography: {
        color: {
            primary: 'text-foreground',
            secondary: 'text-muted-foreground',
            label: 'text-muted-foreground',
            accent: 'text-accent-foreground',
        },
        size: {
            xs: 'text-xs',
            sm: 'text-sm',
            base: 'text-base',
            lg: 'text-lg',
            xl: 'text-[5rem]', // Special for InfoPanel
        },
    },

    panel: {
        header: {
            padding: 'mb-4',
            title: 'text-xs font-regular uppercase',
        },
        container: 'bg-background transition-colors duration-300',
        sectionBorder: 'border-b border-border',
    },

    animation: {
        duration: 'duration-300',
        transition: 'transition-colors',
    }
} as const;

export type Theme = typeof THEME;
