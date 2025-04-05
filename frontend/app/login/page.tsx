"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase'; // Ensure you have firebase setup in this path

const LoginPage = () => {
  const router = useRouter();
  const db = getFirestore();
  const [activeTab, setActiveTab] = useState('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Save user to Firestore with enhanced profile data
  const saveUserToFirestore = async (userId: string, userData: any) => {
    try {
      // Check if user already exists
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      // Define common profile data structure
      const timestamp = new Date().toISOString();
      const profileData = {
        // Basic profile info
        name: userData.name || '',
        email: userData.email || '',
        photoURL: userData.photoURL || null,
        authProvider: userData.authProvider,
        
        // Account status
        accountStatus: 'active',
        emailVerified: userData.emailVerified || false,
        
        // Timestamps
        lastLogin: timestamp,
        
        // Platform specific data
        investmentProfile: {
          riskTolerance: null, // Will be set during onboarding
          investmentGoals: [],
          preferredSectors: []
        },
        
        // Financial data placeholders
        financialInfo: {
          accountConnected: false,
          totalInvested: 0,
          totalReturns: 0,
          portfolioValue: 0
        },
        
        // Usage metrics
        metrics: {
          loginCount: 1,
          lastActive: timestamp
        },
        
        // Settings & preferences
        settings: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          theme: 'light',
          twoFactorEnabled: false
        }
      };
      
      if (!userSnap.exists()) {
        // New user - create full profile
        await setDoc(userRef, {
          ...profileData,
          createdAt: timestamp,
          userId: userId
        });
        console.log("New user added to Firestore");
      } else {
        // Existing user - update relevant fields
        const updates = {
          lastLogin: timestamp,
          'metrics.loginCount': userSnap.data().metrics?.loginCount + 1 || 1,
          'metrics.lastActive': timestamp
        };
        
        // If they logged in with a different provider, note it
        if (userData.authProvider !== userSnap.data().authProvider) {
          const updatesWithAuth = updates as Record<string, any>;
          updatesWithAuth.authProviders = [
            ...(userSnap.data().authProviders || [userSnap.data().authProvider]),
            userData.authProvider
          ];
        }
        
        await setDoc(userRef, updates, { merge: true });
        console.log("User data updated in Firestore");
      }
    } catch (err) {
      console.error("Error saving user data: ", err);
    }
  };

  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Save to Firestore
        await saveUserToFirestore(userCredential.user.uid, {
          name: name,
          email: email,
          authProvider: "email",
          emailVerified: userCredential.user.emailVerified
        });
        
        setSuccess('Account created successfully!');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Update Firestore
        await saveUserToFirestore(userCredential.user.uid, {
          email: userCredential.user.email,
          authProvider: "email",
          emailVerified: userCredential.user.emailVerified
        });
        
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save to Firestore with enhanced profile
      await saveUserToFirestore(user.uid, {
        name: user.displayName,
        email: user.email,
        authProvider: "google",
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col">
      {/* Header with logo */}
      <header className="container mx-auto px-6 py-6">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Savium
        </Link>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
              {success}
            </div>
          )}
          
          {/* Authentication method tabs */}
          <div className="flex border-b mb-6">
            <button 
              className={`flex-1 py-2 text-center ${activeTab === 'email' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('email')}
            >
              Email & Password
            </button>
          </div>
          
          {/* Email & Password form */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin}>
              {isSignUp && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-4"
                disabled={loading}
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
              
              <p className="text-center text-gray-600 mb-4">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 ml-1 hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
              
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="container mx-auto px-6 py-4 text-center text-gray-600 text-sm">
        <p className="mb-2">
          By signing in, you agree to Savium's{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
        </p>
        <p>
          &copy; {new Date().getFullYear()} Savium. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;