import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs principales avec structure plate pour Tailwind 4.0
        'kalel-primary': '#1B4332',
        'kalel-primary-light': '#2D6A4F',
        'kalel-primary-dark': '#14332A',
        'kalel-secondary': '#E85D04',
        'kalel-secondary-light': '#F48C06',
        'kalel-secondary-dark': '#DC2F02',
        'kalel-accent': '#FFB800',
        
        // Structure imbriquée pour compatibilité
        kalel: {
          primary: '#1B4332',
          'primary-light': '#2D6A4F',
          'primary-dark': '#14332A',
          secondary: '#E85D04',
          'secondary-light': '#F48C06',
          'secondary-dark': '#DC2F02',
          accent: '#FFB800',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-kalel-hero': 'linear-gradient(135deg, #1B4332, #2D6A4F, #14332A)',
        'gradient-kalel-primary': 'linear-gradient(135deg, #1B4332, #2D6A4F)',
        'gradient-kalel-secondary': 'linear-gradient(135deg, #E85D04, #F48C06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
export default config 