"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useState } from "react";

import Loading from "@/components/Loading";
import OnboardingScreen from "@/components/OnboardingScreen";
import Cockpit from "@/components/Cockpit";
import Galaxy from "@/components/Galaxy";

/**
 * A component that displays the client app.
 */
export default function ClientApp() {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
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
    <div className="app flex-col-container flex-grow">
      {!isInitialized && <Loading />}
      {isInitialized && (
        <>
          {!isSignedIn && !hasCompletedOnboarding && (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          )}

                      {isSignedIn && !isInGalaxy && (
              <Cockpit 
                onMintShip={handleMintShip} 
                onDeployShip={handleDeployShip}
              />
            )}
            {isSignedIn && isInGalaxy && (
              <Galaxy onBackToCockpit={handleBackToCockpit} />
            )}
        </>
      )}
    </div>
  );
}
