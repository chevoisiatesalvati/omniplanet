'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';

import OnboardingScreen from '@/components/OnboardingScreen';
import Cockpit from '@/components/Cockpit';
import Galaxy from '@/components/Galaxy';
import Header from '@/components/Header';

/**
 * A component that displays the client app.
 */
export default function ClientApp() {
  const { isConnected } = useAccount();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasShip, setHasShip] = useState(false);
  const [isInGalaxy, setIsInGalaxy] = useState(false);

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  const handleMintShip = () => {
    setHasShip(true);
  };

  const handleDeployShip = () => {
    setIsInGalaxy(true);
  };

  const handleBackToCockpit = () => {
    setIsInGalaxy(false);
  };

  return (
    <div className='app flex-col-container flex-grow'>
      <Header />
      {!isConnected && !hasCompletedOnboarding && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {isConnected && !isInGalaxy && (
        <Cockpit onMintShip={handleMintShip} onDeployShip={handleDeployShip} />
      )}
      {isConnected && isInGalaxy && (
        <Galaxy onBackToCockpit={handleBackToCockpit} />
      )}
    </div>
  );
}
