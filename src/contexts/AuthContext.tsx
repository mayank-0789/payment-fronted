import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { checkUserPaidStatus } from '../services/paymentService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isPaidUser: boolean;
  paymentLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshPaymentStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsPaidUser(false); // Reset payment status on logout
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshPaymentStatus = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setPaymentLoading(true);
      const paidStatus = await checkUserPaidStatus(currentUser.uid);
      setIsPaidUser(paidStatus);
      console.log('Payment status refreshed:', paidStatus);
    } catch (error) {
      console.error('Error refreshing payment status:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Check payment status when user changes
      if (user?.uid) {
        try {
          setPaymentLoading(true);
          const paidStatus = await checkUserPaidStatus(user.uid);
          setIsPaidUser(paidStatus);
        } catch (error) {
          console.error('Error checking payment status:', error);
          setIsPaidUser(false);
        } finally {
          setPaymentLoading(false);
        }
      } else {
        setIsPaidUser(false);
        setPaymentLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    isPaidUser,
    paymentLoading,
    signInWithGoogle,
    logout,
    refreshPaymentStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
