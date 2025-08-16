"use client";
import { useState } from "react";
import ClientApp from "@/components/ClientApp";
import Cockpit from "@/components/Cockpit";
import Providers from "@/components/Providers";

/**
 * Home page for the Next.js app
 *
 * @returns The home page
 */
export default function Home() {
  const [hasShip, setHasShip] = useState(false);

  const handleMintShip = () => {
    // TODO: Implement actual ship minting logic
    console.log("Minting ship...");
    setHasShip(true);
  };

  return (
    <Providers>
      {!hasShip ? (
        <Cockpit onMintShip={handleMintShip} />
      ) : (
        <ClientApp />
      )}
    </Providers>
  );
}
