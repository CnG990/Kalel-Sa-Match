/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Breakpoints optimisés pour le marché sénégalais
      screens: {
        'xs': '375px',    // Petits mobiles
        'sm': '640px',    // Mobiles plus grands
        'md': '768px',    // Tablettes portrait
        'lg': '1024px',   // Tablettes paysage et petits laptops
        'xl': '1280px',   // Desktops
        '2xl': '1536px',  // Grands écrans
        // Breakpoints spéciaux pour mobile-first
        'mobile': {'max': '767px'}, // Tout ce qui est mobile
        'tablet': {'min': '768px', 'max': '1023px'}, // Tablettes uniquement
        'desktop': {'min': '1024px'}, // Desktop et plus
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Couleurs spécifiques Sénégal
        senegal: {
          green: '#16a34a',
          yellow: '#f59e0b',
          red: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      // Tailles optimisées pour mobile
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        // Tailles tactiles pour boutons mobile
        'touch': ['1.125rem', { lineHeight: '1.75rem' }],
        'touch-lg': ['1.25rem', { lineHeight: '1.75rem' }],
      },
      // Espacements optimisés pour tactile
      spacing: {
        'touch': '44px', // Taille minimum recommandée pour les éléments tactiles
        'touch-sm': '40px',
        'touch-lg': '48px',
      },
      // Hauteurs spécifiques pour mobile
      height: {
        'mobile-header': '64px',
        'mobile-nav': '60px',
        'mobile-content': 'calc(100vh - 124px)',
        'touch-target': '44px',
      },
      // Largeurs pour mobile
      width: {
        'mobile-full': '100vw',
      },
      // Radius adaptés pour mobile
      borderRadius: {
        'mobile': '12px',
        'mobile-lg': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-mobile': 'slideInMobile 0.2s ease-out',
        'bounce-light': 'bounce 1s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInMobile: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      // Grilles responsives optimisées
      gridTemplateColumns: {
        'mobile-1': 'repeat(1, minmax(0, 1fr))',
        'mobile-2': 'repeat(2, minmax(0, 1fr))',
        'tablet-3': 'repeat(3, minmax(0, 1fr))',
        'desktop-4': 'repeat(4, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
} 