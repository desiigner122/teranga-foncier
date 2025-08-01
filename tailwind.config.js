/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '1rem', // Adjusted default padding
			screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))', // Keep existing primary
          // Example: Add a darker shade for hover
          // dark: 'hsl(222.2, 47.4%, 9.2%)',
					foreground: 'hsl(var(--primary-foreground))',
				},
        // Example: Add a vibrant accent color
        accent_brand: {
            DEFAULT: 'hsl(142.1 76.2% 36.3%)', // Vibrant Green
            foreground: 'hsl(var(--primary-foreground))',
        },
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)', // Add larger radius
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
        'fade-in': {
           from: { opacity: 0 },
           to: { opacity: 1 },
        },
        'slide-in-up': {
            from: { transform: 'translateY(20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.5s ease-out forwards',
			},
      boxShadow: {
        'input': '0 0 0 2px hsl(var(--ring)) inset', // Example focus style
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      textShadow: { // Example text shadow utility
         'DEFAULT': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
         'md': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
         'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.07)',
         'none': 'none',
      }
		},
	},
	plugins: [require('tailwindcss-animate'),
     // Plugin to add text-shadow utilities (optional)
    function({ addUtilities, theme, e }) {
      const utilities = Object.entries(theme('textShadow')).map(([key, value]) => {
        return {
          [`.text-shadow${key === 'DEFAULT' ? '' : `-${e(key)}`}`]: {
            textShadow: value,
          },
        }
      })
      addUtilities(utilities)
    }
  ],
};