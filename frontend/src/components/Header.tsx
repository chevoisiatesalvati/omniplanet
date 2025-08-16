'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { IconCheck, IconCopy, IconUser } from '@/components/Icons';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Header component
 */
export default function Header() {
  const { address, isConnecting, isReconnecting, isConnected, status } =
    useAccount();
  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  return (
    <header>
      <div className='header-inner'>
        <h1 className='site-title'>OmniPlanet</h1>
        <div className='user-info flex-row-container'>
          {!isMounted && <Skeleton className='h-10 w-40 rounded-md' />}
          {isMounted &&
            (status === 'connecting' || isConnecting || isReconnecting) && (
              <Skeleton className='h-10 w-40 rounded-md' />
            )}
          {isMounted && status === 'disconnected' && (
            <ConnectButton showBalance={false} chainStatus='icon' />
          )}
          {isMounted && isConnected && (
            <div className='flex-row-container gap-2'>
              <ConnectButton showBalance={false} chainStatus='full' />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
