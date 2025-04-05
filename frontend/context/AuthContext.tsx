'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// Define user data interface
export interface UserData {
  name: string;
  email: string;
  photoURL: string | null;
  accountStatus: string;
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  authProvider: string;
  financialInfo: {
    accountConnected: boolean;
    portfolioValue: number;
    totalInvested: number;
    totalReturns: number;
    lastDepositDate?: string;
    firstDepositDate?: string;
  };
  investmentProfile: {
    investmentGoals: string[];
    preferredSectors: string[];
    riskTolerance: string | null;
  };
  metrics: {
    lastActive: string;
    loginCount: number;
    lastDeposit?: string;
    lastDepositAmount?: number;
  };
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: "light" | "dark";
    twoFactorEnabled: boolean;
  };
  userId: string;
}

// Auth context type definition
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  authInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  updateUserTheme: (theme: "light" | "dark") => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  authInitialized: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  updateUserTheme: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const router = useRouter();

  // Helper function to update last active timestamp
  const updateLastActive = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        "metrics.lastActive": new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating last active timestamp:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Try to load cached user data if available
    const cachedData = localStorage.getItem('userData');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setUserData(parsedData);
      } catch (e) {
        console.error("Error parsing cached user data", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
      
      if (!user) {
        setLoading(false);
        setUserData(null);
        localStorage.removeItem('userData');
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Set up Firestore listener when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    
    let unsubscribeUser: (() => void) | null = null;
    
    const subscribeToUserData = () => {
      try {
        setLoading(true);
        const userRef = doc(db, "users", currentUser.uid);
        
        // Set up real-time listener
        unsubscribeUser = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as UserData;
            setUserData({...data, userId: currentUser.uid});
            
            // Cache the user data
            localStorage.setItem('userData', JSON.stringify({...data, userId: currentUser.uid}));
            
            // Update login count and last login (once per session)
            if (!userData) {
              updateDoc(userRef, {
                "metrics.loginCount": (data.metrics?.loginCount || 0) + 1,
                "lastLogin": new Date().toISOString(),
              }).catch(err => console.error("Error updating login metrics:", err));
            }
          } else {
            // Create new user document if it doesn't exist
            createNewUserDocument(currentUser);
          }
          
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user data:", error);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error setting up user data listener:", error);
        setLoading(false);
      }
    };
    
    subscribeToUserData();
    
    // Cleanup listener
    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [currentUser]);

  // Create a new user document in Firestore
  const createNewUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Default user data structure
      const newUserData: UserData = {
        userId: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'New User',
        email: user.email || '',
        photoURL: user.photoURL,
        accountStatus: 'active',
        emailVerified: user.emailVerified,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        authProvider: user.providerData[0]?.providerId || 'email',
        financialInfo: {
          accountConnected: false,
          portfolioValue: 0,
          totalInvested: 0,
          totalReturns: 0,
        },
        investmentProfile: {
          investmentGoals: [],
          preferredSectors: [],
          riskTolerance: null,
        },
        metrics: {
          lastActive: new Date().toISOString(),
          loginCount: 1,
        },
        settings: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          theme: 'light',
          twoFactorEnabled: false,
        },
      };
      
      await setDoc(userRef, newUserData);
      setUserData(newUserData);
      
      // Cache the user data
      localStorage.setItem('userData', JSON.stringify(newUserData));
    } catch (error) {
      console.error("Error creating new user document:", error);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by the auth state listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with provided name
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      
      const newUserData: UserData = {
        userId: user.uid,
        name: name,
        email: email,
        photoURL: null,
        accountStatus: 'active',
        emailVerified: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        authProvider: 'email',
        financialInfo: {
          accountConnected: false,
          portfolioValue: 0,
          totalInvested: 0,
          totalReturns: 0,
        },
        investmentProfile: {
          investmentGoals: [],
          preferredSectors: [],
          riskTolerance: null,
        },
        metrics: {
          lastActive: new Date().toISOString(),
          loginCount: 1,
        },
        settings: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          theme: 'light',
          twoFactorEnabled: false,
        },
      };
      
      await setDoc(userRef, newUserData);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User state will be updated by the auth state listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Update last active before signing out
      if (currentUser) {
        await updateLastActive(currentUser.uid);
      }
      
      await firebaseSignOut(auth);
      localStorage.removeItem('userData');
      router.push('/');
    } catch (error: any) {
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, data);
      // The listener will update the state
    } catch (error: any) {
      throw error;
    }
  };

  // Update user theme preference
  const updateUserTheme = async (theme: "light" | "dark") => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        "settings.theme": theme
      });
      // The listener will update the state
    } catch (error: any) {
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    authInitialized,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
    updateUserTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};