"use client";

import { motion } from "framer-motion";
import { 
  Globe, 
  Star, 
  Navigation, 
  Zap, 
  Shield, 
  Heart,
  ArrowLeft,
  Target
} from "lucide-react";

interface GalaxyProps {
  onBackToCockpit: () => void;
}

export default function Galaxy({ onBackToCockpit }: GalaxyProps) {
  const planets = [
    {
      id: 1,
      name: "Arbitrum Prime",
      type: "Mining",
      difficulty: "Easy",
      resources: ["Energy Orbs", "Crystal Shards"],
      color: "from-green-500 to-emerald-600",
      icon: Globe,
      distance: "2.3 LY"
    },
    {
      id: 2,
      name: "Base Alpha",
      type: "Trading",
      difficulty: "Medium",
      resources: ["Tech Parts", "Fuel Cells"],
      color: "from-blue-500 to-cyan-600",
      icon: Star,
      distance: "4.7 LY"
    },
    {
      id: 3,
      name: "Polygon Nexus",
      type: "Combat",
      difficulty: "Hard",
      resources: ["Weapon Cores", "Shield Matrix"],
      color: "from-purple-500 to-pink-600",
      icon: Target,
      distance: "7.1 LY"
    },
    {
      id: 4,
      name: "Optimism Station",
      type: "Research",
      difficulty: "Expert",
      resources: ["Quantum Cores", "Neural Implants"],
      color: "from-red-500 to-orange-600",
      icon: Navigation,
      distance: "9.8 LY"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0a0f] via-[#16213e] to-[#533483] relative overflow-hidden">
      {/* Star background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#16213e] to-[#533483]">
        <div className="absolute inset-0 opacity-30">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 hover:bg-black/60 transition-all duration-300"
              onClick={onBackToCockpit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6 text-cyan-400" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold text-white">Galaxy Explorer</h1>
              <p className="text-cyan-200">Navigate to distant planets and mine resources</p>
            </div>
          </div>
          
          {/* Starship Status */}
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Luminaris Starship</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white">ATK: 10</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-white">DEF: 10</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-white">100%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Planets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planets.map((planet, index) => (
            <motion.div
              key={planet.id}
              className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Planet Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${planet.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <planet.icon className="w-8 h-8 text-white" />
              </div>

              {/* Planet Info */}
              <h3 className="text-xl font-bold text-white text-center mb-2">{planet.name}</h3>
              <p className="text-cyan-200 text-center mb-4">{planet.type} • {planet.difficulty}</p>
              
              {/* Distance */}
              <div className="text-center mb-4">
                <span className="text-sm text-gray-400">Distance: {planet.distance}</span>
              </div>

              {/* Resources */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Resources:</h4>
                <div className="space-y-1">
                  {planet.resources.map((resource, idx) => (
                    <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      {resource}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explore Button */}
              <motion.button
                className={`w-full bg-gradient-to-r ${planet.color} text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Planet
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tips */}
        <motion.div
          className="mt-12 bg-black/20 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
            <Navigation className="mr-2" />
            Navigation Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">Mining Planets</h4>
              <p>Collect resources to upgrade your starship and increase your combat power.</p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">Trading Posts</h4>
              <p>Exchange resources for better equipment and rare materials.</p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">Combat Zones</h4>
              <p>Battle other commanders to gain experience and valuable loot.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
