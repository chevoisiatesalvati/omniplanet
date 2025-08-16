/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OmniPlanet Space Theme Colors
        'omni-deep-space': '#0a0a0f',
        'omni-space-dark': '#1a1a2e',
        'omni-space-blue': '#16213e',
        'omni-cosmic-purple': '#533483',
        'omni-neon-blue': '#00d4ff',
        'omni-electric-blue': '#0099cc',
        'omni-stellar-purple': '#8b5cf6',
        'omni-cosmic-pink': '#ec4899',
        'omni-star-yellow': '#fbbf24',
        'omni-space-gray': '#374151',
        'omni-light-space': '#6b7280',
        'omni-white': '#ffffff',
        'omni-off-white': '#f3f4f6',
      },
      backgroundImage: {
        'space-gradient':
          'linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #533483 100%)',
        'cosmic-gradient':
          'linear-gradient(135deg, #533483 0%, #8b5cf6 50%, #ec4899 100%)',
        'stellar-gradient':
          'linear-gradient(135deg, #00d4ff 0%, #0099cc 50%, #8b5cf6 100%)',
      },
      fontFamily: {
        space: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 6s ease-in-out infinite',
        twinkle: 'twinkle 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff, 0 0 15px #00d4ff',
          },
          '100%': {
            boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        cosmic: '0 8px 32px rgba(0, 212, 255, 0.1)',
        stellar: '0 0 20px rgba(139, 92, 246, 0.3)',
        neon: '0 0 10px rgba(0, 212, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
