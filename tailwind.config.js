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
            // Brand Colors
            navy: {
                DEFAULT: '#0F2C59',
                50: '#E6EAF0',
                100: '#C0C9D6',
                200: '#99A9BD',
                300: '#7388A3',
                400: '#4C688A',
                500: '#0F2C59', // Primary Brand
                600: '#0C2347',
                700: '#091A36',
                800: '#061224',
                900: '#030912',
                950: '#020617' // Added for Dark Mode Background
            },
            orange: {
                DEFAULT: '#FF6B35',
                50: '#FFF0EA',
                100: '#FFDBC9',
                200: '#FFBFA9',
                300: '#FFA388',
                400: '#FF8768',
                500: '#FF6B35', // Primary Accent
                600: '#CC562A',
                700: '#994020',
                800: '#662B15',
                900: '#33150B'
            },
            slate: {
                DEFAULT: '#F1F5F9', // Data Slate
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
  				DEFAULT: '#0F2C59', // Medical Navy
  				foreground: '#FFFFFF'
  			},
  			border: 'hsl(var(--border))',
  			ring: '#FF6B35', // Metabolic Orange for focus rings
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: '#F1F5F9', // Data Slate
  				foreground: '#0F2C59'
  			},
  			accent: {
  				DEFAULT: '#FF6B35', // Metabolic Orange
  				foreground: '#FFFFFF'
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
  				DEFAULT: '#0F2C59', // Navy Sidebar
  				foreground: '#FFFFFF',
  				primary: '#FF6B35',
  				'primary-foreground': '#FFFFFF',
  				accent: '#1a3b6e',
  				'accent-foreground': '#FFFFFF',
  				border: '#1a3b6e',
  				ring: '#FF6B35'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
        boxShadow: {
            'soft': '0 4px 20px -2px rgba(15, 44, 89, 0.1)',
            'card': '0 2px 8px -1px rgba(15, 44, 89, 0.05)',
            'glow': '0 0 15px rgba(255, 107, 53, 0.3)'
        }
  	}
  },
  plugins: [require("tailwindcss-animate")]
}