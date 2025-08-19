# OmniPlanet - Space Commander Terminal

A Next.js application for minting and commanding starships in the OmniPlanet universe. This space commander terminal provides NFT starship collection and management capabilities.

## Project Structure

```
src/
├── app/                  # Next.js App Router directory
│   ├── favicon.ico      # Application favicon
│   ├── globals.css      # Global styles and theme variables
│   ├── layout.tsx       # Root layout with providers and global UI
│   └── page.tsx         # Home page component
│
└── components/          # Reusable React components
    ├── ClientApp.tsx    # Client-side application wrapper
    ├── Cockpit.tsx      # Starship cockpit interface
    ├── CustomConnectButton.tsx # Custom wallet connection button
    ├── Galaxy.tsx       # Galaxy visualization component
    ├── Header.tsx       # Navigation header with authentication status
    ├── Icons.tsx        # Reusable icon components
    ├── OnboardingScreen.tsx # User onboarding interface
    ├── Providers.tsx    # Web3 and theme providers setup
    ├── StarBackground.tsx # Animated star background
    └── Starship3D.tsx   # 3D starship visualization
```

## Getting Started

First, set up your environment variables:

1. Copy the `env.example` file to `.env.local`
2. Add your WalletConnect Project ID for wallet connections

Then install dependencies and start the development server:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## Features

This application includes:

- Next.js 15 App Router
- RainbowKit for wallet connections
- Wagmi for Ethereum interactions
- Three.js for 3D graphics
- Framer Motion for animations
- Tailwind CSS v4 for styling
- TypeScript support
- Space-themed UI with custom animations

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Three.js Documentation](https://threejs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
