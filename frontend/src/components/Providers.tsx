'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, arbitrumSepolia } from 'wagmi/chains';

interface ProvidersProps {
  children: React.ReactNode;
}

const wagmiConfig = getDefaultConfig({
  appName: 'OmniPlanet',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '',
  chains: [baseSepolia, arbitrumSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

/**
 * Providers component that wraps the application in all requisite providers
 *
 * @param props - { object } - The props for the Providers component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
