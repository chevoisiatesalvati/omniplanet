'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

/**
 * Sign in screen
 */
export default function SignInScreen() {
  return (
    <main className='card card--login'>
      <h1 className='sr-only'>Sign in</h1>
      <p className='card-title'>Welcome!</p>
      <p>Please sign in to continue.</p>
      <div className='flex justify-center mt-4'>
        <ConnectButton showBalance={false} chainStatus='full' />
      </div>
    </main>
  );
}
