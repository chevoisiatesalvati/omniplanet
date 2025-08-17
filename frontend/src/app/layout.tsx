import type { Metadata } from 'next';
import './globals.css';
import { Orbitron } from 'next/font/google';
import '@rainbow-me/rainbowkit/styles.css';
import Providers from '@/components/Providers';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
});

export const metadata: Metadata = {
  title: 'OmniPlanet - Space Commander Terminal',
  description:
    'Mint and command your starship in the OmniPlanet universe. A space commander terminal for NFT starship collection and management.',
};

/**
 * Root layout for the Next.js app
 *
 * @param props - { object } - The props for the RootLayout component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={orbitron.variable}>
      <body>
        <div className='root'>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
