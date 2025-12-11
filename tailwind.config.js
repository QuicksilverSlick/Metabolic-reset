/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Open Sans',
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			display: [
  				'Montserrat',
  				'Cal Sans',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'Consolas',
  				'monospace'
  			]
  		},
  		colors: {
            // Brand Colors - Updated to Deep Navy & Gold Theme
            navy: {
                DEFAULT: '#0F2C59', // Brand Navy
                50: '#F0F4F8',
                100: '#D9E2EC',
                200: '#BCCCDC',
                300: '#9FB3C8',
                400: '#829AB1',
                500: '#627D98',
                600: '#486581',
                700: '#334E68',
                800: '#163A70', // Lighter Navy
                900: '#0F2C59', // Brand Navy Base
                950: '#091A35'  // Darker Navy
            },
            orange: {
                DEFAULT: '#FF6B35', // Brand Orange (Updated from #F59E0B)
                50: '#FFF5F0',
                100: '#FFE6DB',
                200: '#FFC9B3',
                300: '#FFAB8A',
                400: '#FF8D61',
                500: '#FF6B35', // Brand Orange Base
                600: '#E65A2C', // Darker for hover
                700: '#CC4920',
                800: '#993314',
                900: '#66220D'
            },
            slate: {
                DEFAULT: '#1E293B',
                50: '#F8FAFC',
                100: '#F1F5F9',
                200: '#E2E8F0',
                300: '#CBD5E1',
                400: '#94A3B8',
                500: '#64748B',
                600: '#475569',
                700: '#334155',
                800: '#1E293B',
                900: '#0F172A'
            },
            // Shadcn Mappings
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
        boxShadow: {
            'soft': '0 4px 20px -2px rgba(15, 44, 89, 0.5)', // Adjusted for Navy theme
            'card': '0 2px 8px -1px rgba(15, 44, 89, 0.3)',
            'glow': '0 0 15px rgba(255, 107, 53, 0.3)' // Orange glow (updated RGB)
        }
  	}
  },
  plugins: [require("tailwindcss-animate")]
}