'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Bot,
  Rocket,
  Sparkles,
  Star,
  Globe,
  Zap,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import CustomConnectButton from './CustomConnectButton';

import StarBackground from '@/components/StarBackground';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const { isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const steps = [
    {
      icon: Bot,
      title: 'AI Commander',
      message:
        'Greetings, Space Commander! I am your AI assistant, ready to guide you through the OmniPlanet universe.',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Rocket,
      title: 'Starship Collection',
      message:
        "In OmniPlanet, you'll mint and command unique starships. Each vessel has its own stats and capabilities.",
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Star,
      title: 'Space Exploration',
      message:
        'Navigate through cosmic battles, collect resources, and expand your fleet across the galaxy.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Globe,
      title: 'Ready to Launch',
      message:
        'Connect your wallet to begin your journey as a Space Commander in the OmniPlanet universe!',
      color: 'from-green-500 to-teal-500',
    },
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');

    const text = currentStepData.message;
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentStepData.message]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsTyping(false);
      setDisplayedText('');
    } else {
      setShowWalletModal(true);
    }
  };

  const skipOnboarding = () => {
    setCurrentStep(steps.length - 1);
  };

  // Auto-navigate to cockpit when user connects
  useEffect(() => {
    if (isConnected) {
      onComplete();
    }
  }, [isConnected, onComplete]);

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-[#0a0a0f] via-[#16213e] to-[#533483] relative overflow-hidden'>
      <StarBackground />
      {/* Main content */}
      <div className='relative z-10 flex items-center justify-center min-h-screen p-8'>
        <div className='w-full max-w-4xl'>
          <motion.div
            className='text-center mb-12'
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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

          {/* AI Chat Interface */}
          <motion.div
            className='bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 mb-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onAnimationComplete={() => setIsIntroComplete(true)}
          >
            <div className='flex items-start space-x-4'>
              {/* AI Avatar */}
              <motion.div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center flex-shrink-0`}
                animate={{
                  boxShadow: [
                    `0 0 20px rgba(0, 212, 255, 0.3)`,
                    `0 0 40px rgba(0, 212, 255, 0.6)`,
                    `0 0 20px rgba(0, 212, 255, 0.3)`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <currentStepData.icon className='w-8 h-8 text-white' />
              </motion.div>

              {/* Chat Content */}
              <div className='flex-1'>
                <div className='flex items-center mb-2'>
                  <h3 className='text-xl font-bold text-white mr-2'>
                    {currentStepData.title}
                  </h3>
                  {isTyping && (
                    <motion.div
                      className='w-2 h-2 bg-cyan-400 rounded-full'
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </div>
                <p className='text-lg text-cyan-100 leading-relaxed'>
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      className='inline-block w-1 h-6 bg-cyan-400 ml-1'
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <AnimatePresence>
            {isIntroComplete && (
              <motion.div
                className='flex justify-between items-center'
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.4 }}
              >
                {currentStep < steps.length - 1 && (
                  <motion.button
                    className='text-cyan-300 hover:text-cyan-100 transition-colors duration-300 flex items-center'
                    onClick={skipOnboarding}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className='w-4 h-4 mr-2' />
                    Skip Tutorial
                  </motion.button>
                )}
                {currentStep === steps.length - 1 && <div></div>}

                <div className='flex items-center space-x-4'>
                  {/* Step indicators */}
                  <div className='flex space-x-2'>
                    {steps.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentStep ? 'bg-cyan-400' : 'bg-gray-600'
                        }`}
                        animate={{
                          scale: index === currentStep ? 1.2 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>

                  {/* Next button */}
                  {currentStep < steps.length - 1 ? (
                    <motion.button
                      className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center'
                      onClick={nextStep}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                      <ChevronRight className='w-4 h-4 ml-2' />
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {isMounted ? (
                        <CustomConnectButton
                          showBalance={false}
                          chainStatus='full'
                        />
                      ) : (
                        <div className='h-10 w-40 rounded-md bg-gray-700' />
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
