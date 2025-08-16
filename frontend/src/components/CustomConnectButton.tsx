'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

interface CustomConnectButtonProps {
  showBalance?: boolean;
  chainStatus?: 'icon' | 'full' | 'none';
  className?: string;
}

export default function CustomConnectButton({
  showBalance = false,
  chainStatus = 'full',
  className = '',
}: CustomConnectButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        if (!ready) {
          return (
            <div
              className={`h-10 w-40 rounded-lg bg-gradient-to-r from-[#533483] to-[#16213e] animate-pulse ${className}`}
              aria-hidden={true}
              style={{
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          );
        }

        if (!connected) {
          return (
            <div className={`relative group ${className}`}>
              <div className='absolute inset-0 bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300' />
              <button
                onClick={openConnectModal}
                type='button'
                className='relative px-6 py-3 bg-gradient-to-r from-[#533483] to-[#16213e] border border-[#00d4ff] rounded-lg text-white font-medium hover:from-[#8b5cf6] hover:to-[#533483] transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#00d4ff]/25'
              >
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse' />
                  <span>Connect Wallet</span>
                  <div
                    className='w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse'
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>
              </button>
            </div>
          );
        }

        if (chain.unsupported) {
          return (
            <div className={`relative group ${className}`}>
              <div className='absolute inset-0 bg-gradient-to-r from-[#ec4899] to-[#dc2626] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300' />
              <button
                onClick={openChainModal}
                type='button'
                className='relative px-6 py-3 bg-gradient-to-r from-[#533483] to-[#16213e] border border-[#ec4899] rounded-lg text-white font-medium hover:from-[#dc2626] hover:to-[#533483] transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#ec4899]/25'
              >
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-[#ec4899] rounded-full animate-pulse' />
                  <span>Wrong Network</span>
                  <div
                    className='w-2 h-2 bg-[#dc2626] rounded-full animate-pulse'
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>
              </button>
            </div>
          );
        }

        return (
          <div className={`relative group ${className}`}>
            <div className='absolute inset-0 bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300' />
            <div className='relative flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border border-[#00d4ff] rounded-lg text-white'>
              {/* Chain Selector */}
              {chainStatus === 'full' && (
                <button
                  onClick={openChainModal}
                  type='button'
                  className='flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-[#533483]/50 to-[#16213e]/50 border border-[#00d4ff]/30 rounded-md hover:from-[#8b5cf6]/50 hover:to-[#533483]/50 transition-all duration-200'
                >
                  {chain.hasIcon && (
                    <div
                      className='w-4 h-4 rounded-full overflow-hidden border border-[#00d4ff]/50'
                      style={{
                        background: chain.iconBackground,
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          className='w-full h-full object-cover'
                        />
                      )}
                    </div>
                  )}
                  <span className='text-sm font-medium text-[#00d4ff]'>
                    {chain.name}
                  </span>
                </button>
              )}

              {/* Account Display */}
              <button
                onClick={openAccountModal}
                type='button'
                className='flex items-center space-x-3 px-3 py-1 bg-gradient-to-r from-[#533483]/30 to-[#16213e]/30 border border-[#00d4ff]/20 rounded-md hover:from-[#8b5cf6]/30 hover:to-[#533483]/30 transition-all duration-200'
              >
                <div className='flex space-x-1'>
                  <div className='w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse' />
                  <div
                    className='w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse'
                    style={{ animationDelay: '0.3s' }}
                  />
                  <div
                    className='w-2 h-2 bg-[#ec4899] rounded-full animate-pulse'
                    style={{ animationDelay: '0.6s' }}
                  />
                </div>
                <span className='text-sm font-mono text-white'>
                  {account.displayName}
                </span>
                {showBalance && account.displayBalance && (
                  <span className='text-xs text-[#00d4ff] font-medium'>
                    ({account.displayBalance})
                  </span>
                )}
              </button>
            </div>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
