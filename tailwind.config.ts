import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === Semantic Tokens (CSS variable-driven) ===
        background: 'var(--bg-1)',
        foreground: 'var(--text-1)',
        surface: {
          DEFAULT: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        'border-default': 'var(--border)',
        'border-hover': 'var(--border-hover)',
        muted: 'var(--muted)',

        // Premium Dark Palette
        dark: {
          0: '#07080A',    // Deepest
          1: '#0B0D10',    // Main background
          2: '#0F1216',    // Surface 1
          3: '#14181E',    // Surface 2
          4: '#1A1F28',    // Surface 3
          5: '#1E242E',    // Border
          6: '#2A3240',    // Border hover
        },
        // Text hierarchy
        content: {
          1: '#ECEEF2',    // Primary
          2: '#A8ADB8',    // Secondary
          3: '#6B7280',    // Muted
        },
        // Accent Amber (Creative Pulse)
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',   // Primary accent
          600: '#D97706',   // Hover
          700: '#B45309',   // Active
          subtle: 'rgba(245, 158, 11, 0.08)',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
        // Dev mode blue
        dev: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          subtle: 'rgba(59, 130, 246, 0.08)',
          glow: 'rgba(59, 130, 246, 0.15)',
        },
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px
        'xs': ['0.75rem', { lineHeight: '1rem' }],         // 12px
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],    // 13px
        'base': ['0.875rem', { lineHeight: '1.375rem' }],  // 14px
        'md': ['0.9375rem', { lineHeight: '1.5rem' }],     // 15px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],      // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],         // 24px
        '3xl': ['2rem', { lineHeight: '2.5rem' }],         // 32px
        '4xl': ['2.5rem', { lineHeight: '3rem' }],         // 40px
        '5xl': ['3rem', { lineHeight: '3.5rem' }],         // 48px
        '6xl': ['3.5rem', { lineHeight: '4rem' }],         // 56px
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '0.25rem',    // 4px
        'DEFAULT': '0.5rem', // 8px
        'md': '0.625rem',   // 10px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.25rem',   // 20px
        '3xl': '1.5rem',    // 24px
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'xl': '0 16px 48px rgba(0, 0, 0, 0.6)',
        'glow-orange': '0 0 20px rgba(255, 106, 0, 0.15)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 106, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
