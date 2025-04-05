'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// Import icons
import { User, Settings, LogOut, ChevronDown, CreditCard, LineChart } from 'lucide-react';

interface UserProfile {
  name?: string;
  image?: string;
}

interface NavbarProps {
  isLoggedIn?: boolean;
  userProfile?: UserProfile | null;
}

const Navbar = ({ isLoggedIn = false, userProfile = null }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Animation variants
  const logoVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };
  
  const buttonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    hover: { 
      scale: 1.05,
      backgroundColor: "#ffd700",
      color: "#000000",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };
  
  const dropdownVariants = {
    closed: { 
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { 
        duration: 0.2
      }
    },
    open: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    closed: { y: -10, opacity: 0 },
    open: { y: 0, opacity: 1 }
  };
  
  // Shimmer effect animation
  const shimmerVariants = {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        repeat: Infinity,
        repeatType: "mirror",
        duration: 3
      }
    }
  };

  return (
    <nav className="bg-black border-b border-yellow-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0" 
              variants={logoVariants}
              initial="initial"
              animate="animate"
            >
              <Link href="/" className="flex items-center gap-2">
                {/* Logo placeholder - replace with your SVG or image */}
                <motion.div 
                  className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center font-bold text-black"
                  whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
                >
                  S
                </motion.div>
                <motion.span 
                  className="text-yellow-400 font-bold text-xl tracking-tight"
                  animate="animate"
                  style={{
                    backgroundImage: "linear-gradient(90deg, rgba(255,215,0,0) 0%, rgba(255,215,0,0.8) 50%, rgba(255,215,0,0) 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text"
                  }}
                >
                  Savium
                </motion.span>
              </Link>
            </motion.div>
          </div>
          
          {/* Navigation Items - Center */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link href="/features" className="text-gray-300 hover:text-yellow-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-yellow-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
            </div>
          </div>
          
          {/* Auth Buttons - Right */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {/* Dashboard Button */}
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  className="hidden md:block"
                >
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-black bg-yellow-400">
                    <LineChart size={16} />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>
                
                {/* Deposit Button with special animation */}
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  className="hidden md:block"
                >
                  <Link 
                    href="/deposit"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-300 text-black shadow-lg shadow-yellow-500/20"
                  >
                    <CreditCard size={16} />
                    <span>Deposit</span>
                  </Link>
                </motion.div>
                
                {/* User Profile with Dropdown */}
                <div className="relative ml-3">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-black/40 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {userProfile?.image ? (
                        <Image
                          src={userProfile.image}
                          alt="User profile"
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-yellow-400"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                          <User size={16} className="text-black" />
                        </div>
                      )}
                      <ChevronDown size={16} className="text-yellow-400 hidden md:block" />
                    </button>
                  </motion.div>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={dropdownVariants}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-black border border-yellow-500/30 backdrop-blur-lg z-10"
                      >
                        <motion.div variants={itemVariants} className="block px-4 py-2 text-xs text-gray-400">
                          {userProfile?.name || "Your Account"}
                        </motion.div>
                        
                        <motion.a
                          href="/profile"
                          variants={itemVariants}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
                        >
                          <User size={16} className="text-yellow-400" />
                          Profile
                        </motion.a>
                        
                        <motion.a
                          href="/settings"
                          variants={itemVariants}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
                        >
                          <Settings size={16} className="text-yellow-400" />
                          Settings
                        </motion.a>
                        
                        <motion.div variants={itemVariants} className="border-t border-yellow-500/20 my-1"></motion.div>
                        
                        <motion.a
                          href="/logout"
                          variants={itemVariants}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut size={16} className="text-yellow-400" />
                          Logout
                        </motion.a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Login Button */}
                <motion.div
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  className='hover:scale-105 transition-transform'
                >
                  <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium border border-yellow-500 text-yellow-400">
                    Login
                  </Link>
                </motion.div>
                
                {/* Sign Up Button */}
                <motion.div
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  className='hover:scale-105 transition-transform'
                >
                  <Link href="/signup" className="px-3 py-2 rounded-md text-sm font-medium bg-yellow-400 text-black">
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;