'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Import icons
import { User, Settings, LogOut, ChevronDown, CreditCard, LineChart, Menu, ChevronRight, ArrowUpRight } from 'lucide-react';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, userData, signOut, loading } = useAuth();
  const router = useRouter();
  
  // Determine if user is logged in based on AuthContext
  const isLoggedIn = !!currentUser;
  
  // Create user profile object from userData
  const userProfile = userData ? {
    name: userData.name,
    email: userData.email,
    image: userData.photoURL
  } : null;
  
  // Handle logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
      setIsDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, mobileMenuOpen]);
  
  // Animation variants
  const logoVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };
  
  const navItemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    hover: {
      y: -3,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };
  
  const buttonVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.6 }
    },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(255, 215, 0, 0.1), 0 4px 6px -2px rgba(255, 215, 0, 0.05)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };
  
  const dropdownVariants = {
    closed: { 
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: 0.2
      }
    },
    open: { 
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25,
        staggerChildren: 0.05,
        delayChildren: 0.03
      }
    }
  };
  
  const itemVariants = {
    closed: { y: -5, opacity: 0 },
    open: { y: 0, opacity: 1 }
  };
  
  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: { 
      opacity: 1,
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <nav className="relative backdrop-filter backdrop-blur-xl bg-black z-50">
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
              <Link href="/" className="flex items-center">
                <div className="flex items-center">
                  {/* Gold coin logo with premium styling */}
                  <div className="relative w-10 h-10 mr-2">
                    <div className="absolute inset-0 rounded-full opacity-60 blur-sm bg-amber-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image 
                        src="/savium-logo1.png" 
                        alt="Savium Logo" 
                        width={72} 
                        height={72} 
                        className="rounded-md"
                      />
                    </div>
                  </div>
                                
                  {/* Company name with premium styling */}
                  <div className="ml-1">
                    <span className="text-2xl">
                      $avium
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
          
          {/* Navigation Items - Center (Desktop) */}
          <div className="hidden md:flex items-center justify-center flex-1 ml-10">
            <div className="flex space-x-8">
              <motion.div
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Link href="/features" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium tracking-wide transition-colors">
                  Features
                </Link>
              </motion.div>
              
              <motion.div
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ delay: 0.1 }}
              >
                <Link href="/pricing" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium tracking-wide transition-colors">
                  Pricing
                </Link>
              </motion.div>
              
              <motion.div
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ delay: 0.2 }}
              >
                <Link href="/about" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium tracking-wide transition-colors">
                  About
                </Link>
              </motion.div>
            </div>
          </div>
          
          {/* Auth Buttons - Right */}
          <div className="flex items-center space-x-4">
            {loading ? (
              // Premium loading animation
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-amber-400/20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
              </div>
            ) : isLoggedIn ? (
              <>
              
                {/* Dashboard Button (Desktop) */}
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="hidden md:flex"
                >
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium border border-gray-700 text-amber-400 bg-gray-800/60 hover:bg-gray-800 transition-colors"
                  >
                    <LineChart size={16} />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>
                
                {/* Deposit Button with premium styling (Desktop) */}
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="hidden md:flex"
                >
                  <Link 
                    href={`/deposit/${currentUser?.uid}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/20"
                  >
                    <CreditCard size={16} />
                    <span>Deposit</span>
                  </Link>
                </motion.div>
                
                {/* User Profile with Dropdown */}
                <div className="relative ml-3 user-dropdown">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors focus:outline-none"
                    >
                      {userProfile?.image ? (
                        <Image
                          src={userProfile.image}
                          alt="User profile"
                          width={30}
                          height={30}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                          <span className="text-black font-bold text-sm">
                            {userProfile?.name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                    </button>
                  </motion.div>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={dropdownVariants}
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-gray-900 border border-gray-800 shadow-xl shadow-black/30 backdrop-filter backdrop-blur-lg overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-800">
                          <motion.p variants={itemVariants} className="text-sm font-medium text-amber-400">
                            {userProfile?.name || "Account"}
                          </motion.p>
                          <motion.p variants={itemVariants} className="text-xs text-gray-400 truncate mt-0.5">
                            {userProfile?.email || ""}
                          </motion.p>
                        </div>
                        
                        <div className="py-1">
                          <motion.div variants={itemVariants}>
                            <Link
                              href="/dashboard"
                              className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <LineChart size={16} className="text-amber-500" />
                                <span>Dashboard</span>
                              </div>
                              <ChevronRight size={14} className="text-gray-500" />
                            </Link>
                          </motion.div>
                          
                          <motion.div variants={itemVariants}>
                            <Link
                              href="/settings"
                              className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Settings size={16} className="text-amber-500" />
                                <span>Settings</span>
                              </div>
                              <ChevronRight size={14} className="text-gray-500" />
                            </Link>
                          </motion.div>
                        </div>
                        
                        <div className="py-1 border-t border-gray-800">
                          <motion.button
                            onClick={handleLogout}
                            variants={itemVariants}
                            className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <LogOut size={16} className="text-amber-500" />
                              <span>Log out</span>
                            </div>
                            <ArrowUpRight size={14} className="text-gray-500" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button 
                    className="mobile-menu-button p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <Menu size={20} className="text-amber-400" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Login Button with premium styling */}
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="hidden sm:block"
                >
                  <Link 
                    href="/login" 
                    className="px-4 py-2 rounded-md text-sm font-medium text-amber-400 border border-amber-400/30 hover:border-amber-400/60 transition-colors"
                  >
                    Log in
                  </Link>
                </motion.div>
                
                {/* Sign Up Button with premium styling */}
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Link 
                    href="/login" 
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 shadow-lg shadow-amber-500/20"
                  >
                    Get Started
                  </Link>
                </motion.div>
                
                {/* Mobile menu button */}
                <div className="sm:hidden">
                  <button 
                    className="mobile-menu-button p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <Menu size={20} className="text-amber-400" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu - Full screen animated slide-in */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-0 bg-black/95 backdrop-blur-lg flex flex-col z-50 mobile-menu"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
              <div className="flex items-center">
                {/* Gold coin logo with premium styling */}
                <div className="relative w-8 h-8 mr-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full opacity-70 blur-sm"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-black font-black text-base">S</span>
                  </div>
                </div>
                
                {/* Company name with premium styling */}
                <div className="ml-1">
                  <span className="font-bold text-lg bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                    Savium
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              {isLoggedIn ? (
                <>
                  {/* Mobile user profile */}
                  <motion.div 
                    variants={itemVariants} 
                    className="mb-8 flex items-center"
                  >
                    {userProfile?.image ? (
                      <Image
                        src={userProfile.image}
                        alt="User profile"
                        width={48}
                        height={48}
                        className="rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-4">
                        <span className="text-black font-bold text-xl">
                          {userProfile?.name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {userProfile?.name || "User"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {userProfile?.email || ""}
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Dashboard Button */}
                  <motion.div variants={itemVariants} className="mb-3">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-500/10 p-2.5 rounded-full">
                          <LineChart size={20} className="text-amber-500" />
                        </div>
                        <span className="text-white font-medium">Dashboard</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-500" />
                    </Link>
                  </motion.div>
                  
                  {/* Deposit Button */}
                  <motion.div variants={itemVariants} className="mb-3">
                    <Link 
                      href={`/deposit/${currentUser?.uid}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-4 bg-amber-500 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-black/10 p-2.5 rounded-full">
                          <CreditCard size={20} className="text-black/70" />
                        </div>
                        <span className="text-black font-medium">Deposit Funds</span>
                      </div>
                      <ChevronRight size={20} className="text-black/50" />
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    <motion.div variants={itemVariants}>
                      <Link 
                        href="/login" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-center w-full py-3 bg-gray-800 text-amber-400 font-medium rounded-lg border border-amber-500/30"
                      >
                        Log in
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Link 
                        href="/signup" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-center w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 font-medium rounded-lg"
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </div>
                </>
              )}
              
              {/* Navigation Links */}
              <div className="mt-6 space-y-3">
                <motion.div variants={itemVariants} className="border-b border-gray-800 pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Navigation
                  </h3>
                </motion.div>
                
                {["Features", "Pricing", "About"].map((item, index) => (
                  <motion.div key={item} variants={itemVariants}>
                    <Link 
                      href={`/${item.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <span className="text-gray-300">{item}</span>
                      <ChevronRight size={18} className="text-gray-500" />
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Additional menu items */}
              {isLoggedIn && (
                <div className="mt-auto pt-6">
                  <motion.div 
                    variants={itemVariants}
                    onClick={handleLogout}
                    className="flex items-center justify-between p-4 text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} className="text-amber-500" />
                      <span>Logout</span>
                    </div>
                    <ArrowUpRight size={18} className="text-gray-500" />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;