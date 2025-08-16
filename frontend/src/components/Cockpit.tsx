"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Rocket, 
  Zap, 
  Shield, 
  Heart, 
  Target, 
  Globe, 
  Star,
  Play,
  Sparkles
} from "lucide-react";
import Starship3D from "./Starship3D";

interface CockpitProps {
  onMintShip: () => void;
}

export default function Cockpit({ onMintShip }: CockpitProps) {
  const [isHologramActive, setIsHologramActive] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);

  const cockpitVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut" as const
      }
    }
  };

  const panelVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const hologramVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "backOut" as const
      }
    }
  };

  const handleMintShip = () => {
    setShowMintDialog(true);
    setTimeout(() => {
      onMintShip();
      setShowMintDialog(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Simple star background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-30">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                left: `${(i * 7.3) % 100}%`,
                top: `${(i * 3.7) % 100}%`,
                animationDelay: `${(i * 0.1) % 3}s`,
                animationDuration: `${2 + (i % 2)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main cockpit container */}
      <motion.div
        className="relative z-10 flex items-center justify-center min-h-screen p-8"
        variants={cockpitVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-6xl font-bold text-white mb-4"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 40px rgba(59, 130, 246, 0.8)",
                  "0 0 20px rgba(59, 130, 246, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              OMNIPLANET
            </motion.h1>
            <p className="text-xl text-blue-200">Space Commander Terminal</p>
          </motion.div>

          {/* Main Starship Display */}
          <motion.div
            className="w-full mb-8 h-[30rem]"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 h-full">
              <AnimatePresence>
                {!isHologramActive ? (
                  <motion.div
                    key="inactive"
                    className="h-full flex flex-col justify-between py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <Globe className="w-24 h-24 text-purple-400 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-white mb-4">No Starship Detected</h2>
                      <p className="text-xl text-blue-200">Mint your first starship to begin your space commander journey</p>
                    </div>
                    <div className="text-center">
                      <motion.button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center mx-auto text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsHologramActive(true)}
                      >
                        <Rocket className="mr-3" />
                        Mint a Ship
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active"
                    className="h-full flex flex-col"
                    variants={hologramVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="text-3xl font-bold text-purple-400 mb-6 flex items-center justify-center">
                      <Sparkles className="mr-3" />
                      Luminaris Starship
                    </h2>
                    <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
                      {/* Starship Specs - Left Side */}
                      <div className="w-full lg:w-80 border rounded-lg p-6">
                        <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
                          <Star className="mr-2" />
                          Starship Specifications
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                              <span className="text-white">Attack</span>
                            </div>
                            <span className="text-yellow-400 font-semibold">10</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Shield className="w-5 h-5 text-blue-400 mr-2" />
                              <span className="text-white">Defense</span>
                            </div>
                            <span className="text-blue-400 font-semibold">10</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Heart className="w-5 h-5 text-red-400 mr-2" />
                              <span className="text-white">Health</span>
                            </div>
                            <span className="text-red-400 font-semibold">100</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Target className="w-5 h-5 text-green-400 mr-2" />
                              <span className="text-white">Speed</span>
                            </div>
                            <span className="text-green-400 font-semibold">85</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Star className="w-5 h-5 text-purple-400 mr-2" />
                              <span className="text-white">Energy</span>
                            </div>
                            <span className="text-purple-400 font-semibold">75</span>
                          </div>
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
          {isHologramActive && (
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center mx-auto text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMintShip}
              >
                <Play className="mr-3" />
                Deploy Starship
              </motion.button>
            </motion.div>
          )}


        </div>
      </motion.div>

      {/* Minting Dialog */}
      <AnimatePresence>
        {showMintDialog && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-900 to-purple-900 border border-blue-500/50 rounded-lg p-8 text-center max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Rocket className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Deploying Starship</h3>
              <p className="text-blue-200 mb-4">Initializing your command vessel...</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
