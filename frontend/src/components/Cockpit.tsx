'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useStarship } from '@/hooks/useStarship';
import { useShipSpecs } from '@/hooks/useShipSpecs';
import { useCurrentNetworkKey } from '@/hooks/useCurrentNetwork';
import {
  Rocket,
  Zap,
  Shield,
  Heart,
  Globe,
  Star,
  Sparkles,
  MapPin,
} from 'lucide-react';
import Starship3D from './Starship3D';
import StarBackground from './StarBackground';
import { type NetworkKey } from '@/config/networks';
import { useGLTF } from '@react-three/drei';

interface CockpitProps {
  onMintShip: () => void;
  onDeployShip?: () => void;
}

// Planet data for location tracking
const PLANETS = {
  'arbitrum-sepolia': { name: 'Vulcania', type: 'Mining' },
  'base-sepolia': { name: 'Amethea', type: 'Research' },
} as const;

export default function Cockpit({ onMintShip, onDeployShip }: CockpitProps) {
  const [isHologramActive, setIsHologramActive] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const currentNetwork = useCurrentNetworkKey('base-sepolia');
  const { state, mint, refresh } = useStarship(currentNetwork);
  const { state: shipSpecsState, refresh: refreshShipSpecs } = useShipSpecs(
    currentNetwork,
    state.tokenId || 1n
  );

  // Determine current ship location
  const currentLocation = useMemo(() => {
    if (!state.hasShip || !state.tokenId) return null;

    // Find which network has the ship
    for (const [network, balanceInfo] of Object.entries(state.balances)) {
      if (balanceInfo.tokenIds.includes(state.tokenId!)) {
        return PLANETS[network as NetworkKey];
      }
    }
    return null;
  }, [state.hasShip, state.tokenId, state.balances]);

  const cockpitVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        ease: 'easeOut' as const,
      },
    },
  };

  const panelVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  };

  const hologramVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'backOut' as const,
      },
    },
  };

  const handleMintShip = async () => {
    setShowMintDialog(true);
    try {
      await mint(1n);
      await refresh();
      await refreshShipSpecs();
      setIsHologramActive(true);
      onMintShip();
    } catch (e) {
      // ignore for now
    } finally {
      setShowMintDialog(false);
    }
  };

  const handleDeployShip = () => {
    if (onDeployShip) {
      onDeployShip();
    }
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-[#0a0a0f] via-[#16213e] to-[#533483] relative overflow-hidden'>
      <StarBackground />
      {/* Main cockpit container */}
      <motion.div
        className='relative z-10 flex items-center justify-center min-h-screen p-8'
        variants={cockpitVariants}
        initial='hidden'
        animate='visible'
      >
        <div className='w-full px-8'>
          <motion.div
            className='text-center mb-12'
            variants={panelVariants}
            initial='hidden'
            animate='visible'
          >
            <motion.h1
              className='text-6xl font-bold text-white mb-4'
              animate={{
                textShadow: [
                  '0 0 20px rgba(0, 212, 255, 0.5)',
                  '0 0 40px rgba(0, 212, 255, 0.8)',
                  '0 0 20px rgba(0, 212, 255, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              OMNIPLANET
            </motion.h1>
            <p className='text-xl text-cyan-200'>Space Commander Terminal</p>
          </motion.div>

          {/* Main Starship Display */}
          <motion.div
            className='w-full mb-8 h-[30rem]'
            variants={panelVariants}
            initial='hidden'
            animate='visible'
            transition={{ delay: 0.3 }}
          >
            <div className='bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 h-full'>
              <AnimatePresence>
                {state.isLoading ? (
                  <motion.div
                    key='loading'
                    className='h-full flex flex-col justify-center items-center py-20 gap-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mb-6'></div>
                    <h2 className='text-2xl font-bold text-white mb-2'>
                      Scanning for Starships
                    </h2>
                    <p className='text-lg text-cyan-200 text-center'>
                      Checking all known galaxies for your command vessel...
                    </p>
                  </motion.div>
                ) : !isHologramActive && !state.hasShip ? (
                  <motion.div
                    key='inactive'
                    className='h-full flex flex-col justify-between py-20 gap-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className='text-center'>
                      <Globe className='w-24 h-24 text-cyan-400 mx-auto mb-6' />
                      <h2 className='text-3xl font-bold text-white mb-4'>
                        No Starship Detected
                      </h2>
                      <p className='text-xl text-cyan-200 mb-8'>
                        Mint your first starship to begin your space commander
                        journey
                      </p>
                    </div>
                    <div className='text-center'>
                      <motion.button
                        className='bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center mx-auto text-lg'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMintShip}
                      >
                        <Rocket className='mr-3' />
                        Mint a Ship
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key='active'
                    className='h-full flex flex-col'
                    variants={hologramVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <div className='flex items-center justify-center mb-6'>
                      <h2 className='text-3xl font-bold text-cyan-400 flex items-center'>
                        <Sparkles className='mr-3' />
                        Luminaris Starship
                      </h2>
                      {currentLocation && (
                        <div className='ml-6 flex items-center bg-black/30 border border-cyan-500/30 rounded-lg px-3 py-1'>
                          <MapPin className='w-4 h-4 text-cyan-400 mr-2' />
                          <span className='text-cyan-200 text-sm'>
                            Currently at {currentLocation.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-h-0 flex flex-col lg:flex-row gap-8'>
                      {/* Starship Specs - Left Side */}
                      <div className='w-full lg:w-80 rounded-lg p-6'>
                        <h3 className='text-xl font-bold text-yellow-400 mb-4 flex items-center'>
                          <Star className='mr-2' />
                          Starship Specs
                        </h3>
                        <div className='space-y-4'>
                          {shipSpecsState.isLoading ? (
                            <div className='text-center py-4'>
                              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto'></div>
                              <p className='text-cyan-200 mt-2'>
                                Loading specs...
                              </p>
                            </div>
                          ) : shipSpecsState.error ? (
                            <div className='text-center py-4'>
                              <p className='text-red-400'>
                                Error loading specs
                              </p>
                              <p className='text-red-300 text-sm'>
                                {shipSpecsState.error}
                              </p>
                            </div>
                          ) : shipSpecsState.specs ? (
                            <>
                              <div className='flex justify-between items-center'>
                                <div className='flex items-center'>
                                  <Zap className='w-5 h-5 text-yellow-400 mr-2' />
                                  <span className='text-white'>Attack</span>
                                </div>
                                <span className='text-yellow-400 font-semibold'>
                                  {Number(shipSpecsState.specs.attack)}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <div className='flex items-center'>
                                  <Shield className='w-5 h-5 text-blue-400 mr-2' />
                                  <span className='text-white'>Defense</span>
                                </div>
                                <span className='text-blue-400 font-semibold'>
                                  {Number(shipSpecsState.specs.defense)}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <div className='flex items-center'>
                                  <Heart className='w-5 h-5 text-red-400 mr-2' />
                                  <span className='text-white'>Health</span>
                                </div>
                                <span className='text-red-400 font-semibold'>
                                  {Number(shipSpecsState.specs.health)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className='text-center py-4'>
                              <p className='text-gray-400'>
                                No specs available
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Starship 3D Render - Right Side */}
                      <Starship3D />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Deploy Button - Outside the starship container */}
          {(isHologramActive || state.hasShip) && (
            <motion.div
              className='text-center mb-8'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className='bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center mx-auto text-lg'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeployShip}
              >
                <Rocket className='mr-3' />
                Go into the Galaxy
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Minting Dialog */}
      <AnimatePresence>
        {showMintDialog && (
          <motion.div
            className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='bg-gradient-to-br from-[#0a0a0f] to-[#16213e] border border-cyan-500/50 rounded-lg p-8 text-center max-w-md mx-4'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className='w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Rocket className='w-8 h-8 text-white' />
              </motion.div>
              <h3 className='text-2xl font-bold text-white mb-2'>
                Deploying Starship
              </h3>
              <p className='text-cyan-200 mb-4'>
                Initializing your command vessel...
              </p>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <motion.div
                  className='bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full'
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Preload ship model for faster interaction
useGLTF.preload('/luminaris_starship.glb');
