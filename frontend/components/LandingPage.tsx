"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Spline3DText from './SplineText3D';
import Waves from '@/components/ui/waves';
import { motion } from 'framer-motion';
import Image from 'next/image';

const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Simulate loading progress
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Give it a slight delay before hiding the loader
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
      setLoadingProgress(progress);
    }, 200); // Update every 200ms
    
    return () => clearInterval(interval);
  }, []);
  
  // Prevent scrolling while loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    }
  }, [loading]);
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Savium logo or text */}
          <div className="mb-10 relative">
            <h1 className="text-6xl font-bold text-yellow-500">Savium</h1>
            <div className="h-1 bg-blue-200 w-full mt-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Loading progress number */}
          <div className="fixed bottom-10 right-10">
            <span className="text-8xl font-bold text-yellow-500">
              {loadingProgress}
              <span className="text-4xl">%</span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Hero Section with Spline 3D */}
      <div className="min-h-screen flex flex-col pt-16">
        <main className="flex-grow">
          <Spline3DText 
            url="https://prod.spline.design/wJZpXl8YIuYVexmU/scene.splinecode" 
            height="600px"
            className="w-full"
          />
        </main>
      </div>

      {/* Hero Content with ShaderGradient */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-800 mb-4">
                  Earn up to <span className="relative">7.1%<sup className="absolute -top-3 text-base text-yellow-500">*</sup></span> return<br />
                  <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Big Future.
                  </span>
                </h1>
                <p className="text-xs text-gray-500 mt-2 mb-6">
                  *Based on historical performance. Past returns do not guarantee future results.
                </p>
                <p className="text-xl text-gray-600 mb-8">
                  Start your investment journey with as little as $5. Savium helps you grow your wealth with micro-investments that fit your lifestyle.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/login">
                    <button className="px-6 py-3 text-black rounded-lg shadow-lg hover:shadow-xl hover:shadow-yellow-200/40 transition transform hover:-translate-y-1">
                      Start Investing
                    </button>
                  </Link>
                  <Link href="/features">
                    <button className="px-6 py-3 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition">
                      Learn More
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 to-blue-100/40 backdrop-blur-sm z-0"></div>
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Your Portfolio</p>
                      <p className="text-2xl text-gray-800 font-bold">$12,456.78</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      +5.2% Today
                    </div>
                  </div>

                  {/* Fixed chart image placement */}
                  <div className="h-48 mb-6 bg-gradient-to-r from-yellow-500/10 to-blue-500/10 rounded-lg overflow-hidden">
                    <div className="relative w-full h-full">
                      <Image
                        src="/portfolio.png"
                        alt="Portfolio Growth Chart"
                        fill
                        className="object-cover rounded-lg"
                        priority
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLElement;
                          if (target.parentElement) {
                            target.parentElement.classList.add('bg-yellow-100/30');
                            target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-yellow-600">Portfolio Chart</div>';
                          }
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-white/70 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs text-gray-600">
                        Last 6 months
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/40 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-xl font-bold text-green-600">+$876.54</p>
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Monthly Contribution</p>
                      <p className="text-xl font-bold text-gray-800">$250.00</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Blur Gradient */}
      <section id="features" className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-block px-3 py-1 bg-yellow-100 rounded-full text-yellow-600 text-sm font-medium mb-4">
              Why Choose Savium?
            </div>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
              Features that <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">Empower</span> You
            </h2>
            <p className="text-xl text-gray-600">
              Modern tools designed to make investing accessible and enjoyable for everyone.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl hover:shadow-yellow-200/20 transition duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Micro-Investments</h3>
              <p className="text-gray-600 mb-6">
                Start with just $5 and grow your portfolio over time with regular small investments that fit your budget.
              </p>
              <Link href="/features" className="text-yellow-600 font-medium flex items-center group">
                Learn more <span className="ml-1 group-hover:ml-2 transition-all">→</span>
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl hover:shadow-yellow-200/20 transition duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Diversified Portfolios</h3>
              <p className="text-gray-600 mb-6">
                Access expertly crafted portfolios that spread your investments across multiple assets to minimize risk.
              </p>
              <Link href="/features" className="text-yellow-600 font-medium flex items-center group">
                Learn more <span className="ml-1 group-hover:ml-2 transition-all">→</span>
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl hover:shadow-yellow-200/20 transition duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Bank-Level Security</h3>
              <p className="text-gray-600 mb-6">
                Your investments are protected with the highest level of encryption and security standards in the industry.
              </p>
              <Link href="/features" className="text-yellow-600 font-medium flex items-center group">
                Learn more <span className="ml-1 group-hover:ml-2 transition-all">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - With Animated Steps */}
      <section id="how-it-works" className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-white/30"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-block px-3 py-1 bg-yellow-100 rounded-full text-yellow-600 text-sm font-medium mb-4">
              Simple Process
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              How It <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600">
              Getting started with Savium is easy and takes just minutes.
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div 
                className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 mx-auto shadow-lg relative z-20">
                  1
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Sign Up</h3>
                <p className="text-gray-600 text-center">
                  Create your account in minutes and link your bank account securely. We use bank-level security to protect your information.
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="inline-block animate-bounce text-yellow-500">↓</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 mx-auto shadow-lg relative z-20">
                  2
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Choose Your Strategy</h3>
                <p className="text-gray-600 text-center">
                  Select from our expert-designed investment portfolios based on your financial goals and risk tolerance.
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="inline-block animate-bounce text-yellow-500">↓</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 mx-auto shadow-lg relative z-20">
                  3
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Watch Your Money Grow</h3>
                <p className="text-gray-600 text-center">
                  Set up automatic investments and track your progress in real-time through our intuitive dashboard.
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="inline-block text-green-500 text-xl">✓</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Gradient Cards */}
      <section id="testimonials" className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-blue-50/30"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-block px-3 py-1 bg-yellow-100 rounded-full text-yellow-600 text-sm font-medium mb-4">
              Success Stories
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              What Our <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">Users</span> Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied investors who have transformed their financial future with Savium.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-gradient-to-br from-white to-yellow-50 p-1 rounded-2xl shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-white h-full rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Investing since 2023</p>
                  </div>
                </div>
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-gray-600 italic">
                  &quot;I never thought investing was for me until I found Savium. The micro-investment approach made it so easy to get started without feeling overwhelmed.&quot;
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-white to-yellow-50 p-1 rounded-2xl shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-white h-full rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <h4 className="font-semibold">Michael Rodriguez</h4>
                    <p className="text-sm text-gray-500">Investing since 2022</p>
                  </div>
                </div>
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-gray-600 italic">
                  &quot;The round-up feature has been a game-changer for me. I&apos;ve saved and invested more in 6 months than I did in years before using Savium.&quot;
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-white to-yellow-50 p-1 rounded-2xl shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-white h-full rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                    E
                  </div>
                  <div>
                    <h4 className="font-semibold">Emma Chen</h4>
                    <p className="text-sm text-gray-500">Investing since 2024</p>
                  </div>
                </div>
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-gray-600 italic">
                  &quot;As someone new to investing, I appreciate how Savium makes everything transparent and educational. I&apos;m learning while my money grows!&quot;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section with Waves Background */}
      <section className="relative overflow-hidden">
      <Waves
          lineColor="#f5bf03"
          backgroundColor="rgba(255, 255, 255, 0.2)" waveSpeedX={0.02}
          waveSpeedY={0.01} waveAmpX={40}
          waveAmpY={20}
          friction={0.9} tension={0.01} maxCursorMove={120}
          xGap={12}
          yGap={36}
          />
        
        <div className="container mx-auto px-6 py-32 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-white/90 backdrop-blur-md p-12 rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Ready to Start Your Investment Journey?
            </h2>
              <p className="text-xl mb-10 text-gray-600">
                Join thousands of people who are already growing their wealth with Savium. It only takes 3 minutes to get started.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link href="/login">
                  <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-yellow-200/40 transition transform hover:-translate-y-1">
                    Create Your Account
                  </button>
                </Link>
                <Link href="/features">
                  <button className="px-8 py-4 border-2 border-yellow-500 text-yellow-600 rounded-xl hover:bg-yellow-50 transition">
                    Learn More
                  </button>
                </Link>
              </div>
              
              <div className="mt-10 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex items-center">
                  <span className="inline-block w-5 h-5 bg-green-100 rounded-full mr-2 flex-shrink-0">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full m-1"></span>
                  </span>
                  <span className="text-gray-700">No hidden fees</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-5 h-5 bg-green-100 rounded-full mr-2 flex-shrink-0">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full m-1"></span>
                  </span>
                  <span className="text-gray-700">Cancel anytime</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-5 h-5 bg-green-100 rounded-full mr-2 flex-shrink-0">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full m-1"></span>
                  </span>
                  <span className="text-gray-700">24/7 customer support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Light Theme */}
      <footer className="bg-white text-gray-800 py-16 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <span className="text-2xl font-bold">Savium</span>
              </div>
              <p className="text-gray-600 mb-6">
                Making investing accessible to everyone through micro-investments and smart technology.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'instagram'].map(social => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-white transition duration-300"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Company",
                links: [
                  { name: "About Us", href: "/about" },
                  { name: "Careers", href: "/careers" },
                  { name: "Press", href: "/press" },
                  { name: "Contact", href: "/contact" }
                ]
              },
              {
                title: "Resources",
                links: [
                  { name: "Blog", href: "/blog" },
                  { name: "Help Center", href: "/help" },
                  { name: "Investment Guide", href: "/guide" },
                  { name: "FAQs", href: "/faqs" }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Security", href: "/security" },
                  { name: "Disclosures", href: "/disclosures" }
                ]
              }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map(link => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-gray-600 hover:text-yellow-500 transition"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Savium. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-500 hover:text-yellow-500 transition text-sm">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-yellow-500 transition text-sm">
                Privacy
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-yellow-500 transition text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Asset Loading Indicator */}
      <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-md">
        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-yellow-600">Loading Assets</span>
      </div>
    </div>
  );
};

export default LandingPage;