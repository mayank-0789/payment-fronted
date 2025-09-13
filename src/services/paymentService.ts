import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { User } from 'firebase/auth';
import axios from 'axios';

// Payment backend URL - update this to your actual backend URL
// const PAYMENT_BACKEND_URL = 'http://localhost:3000';
const PAYMENT_BACKEND_URL = 'https://razor-payment-backend.onrender.com';

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaidUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  paidAt: any; // Firestore timestamp
  status: 'paid';
}

// Verify payment with backend
export const verifyPayment = async (paymentData: PaymentVerificationData): Promise<boolean> => {
  try {
    console.log('Verifying payment with backend:', paymentData);
    
    const response = await axios.post(`${PAYMENT_BACKEND_URL}/payment/verify`, paymentData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Payment verification response:', response.data);
    
    return response.data.success === true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
};

// Add user to paid_user collection
export const addToPaidUsers = async (
  user: User, 
  paymentData: PaymentVerificationData,
  orderAmount: number = 100,
  currency: string = 'INR'
): Promise<boolean> => {
  try {
    // Debug authentication state
    console.log('Current auth state:', {
      currentUser: auth.currentUser?.uid,
      providedUser: user.uid,
      isAuthenticated: !!auth.currentUser
    });

    console.log('Adding user to paid_users collection:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

    if (!user.uid) {
      throw new Error('User UID is required');
    }

    if (!auth.currentUser) {
      throw new Error('User is not authenticated');
    }

    const paidUserData: PaidUser = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      amount: orderAmount,
      currency: currency,
      paidAt: serverTimestamp(),
      status: 'paid'
    };

    // Use user UID as document ID for easy lookup
    const userDocRef = doc(db, 'paid_users', user.uid);
    
    console.log('Attempting to write to Firestore:', {
      collection: 'paid_users',
      docId: user.uid,
      data: paidUserData
    });
    
    await setDoc(userDocRef, paidUserData);

    console.log('✅ User successfully added to paid_users collection:', user.uid);
    return true;
  } catch (error) {
    console.error('Error adding user to paid_users collection:', error);
    return false;
  }
};

// Check if user is already paid
export const checkUserPaidStatus = async (userId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'paid_users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as PaidUser;
      console.log('User payment status:', userData);
      return userData.status === 'paid';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking user paid status:', error);
    return false;
  }
};

// Get user payment details
export const getUserPaymentDetails = async (userId: string): Promise<PaidUser | null> => {
  try {
    const userDocRef = doc(db, 'paid_users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as PaidUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user payment details:', error);
    return null;
  }
};

// Complete payment flow: verify + add to Firestore
export const completePaymentFlow = async (
  user: User,
  paymentData: PaymentVerificationData,
  orderAmount: number = 100
): Promise<{ success: boolean; message: string }> => {
  try {
    // Step 1: Verify payment with backend
    const isPaymentValid = await verifyPayment(paymentData);
    
    if (!isPaymentValid) {
      return {
        success: false,
        message: 'Payment verification failed. Please contact support.'
      };
    }

    // Step 2: Add user to paid_users collection
    const isUserAdded = await addToPaidUsers(user, paymentData, orderAmount);
    
    if (!isUserAdded) {
      return {
        success: false,
        message: 'Payment verified but failed to update user status. Please contact support.'
      };
    }

    return {
      success: true,
      message: 'Payment completed successfully! You now have access to premium features.'
    };
  } catch (error) {
    console.error('Complete payment flow error:', error);
    return {
      success: false,
      message: 'An error occurred during payment processing. Please try again.'
    };
  }
};
