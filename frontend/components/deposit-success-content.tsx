"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function DepositSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get payment_intent and redirect_status from URL
    const intent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    
    if (intent && redirectStatus === 'succeeded') {
      setPaymentIntent(intent);
      
      // Fetch the actual payment details from Firestore
      const fetchPaymentDetails = async () => {
        try {
          // Find deposit document by payment intent - using Firestore v9 syntax
          const depositsRef = collection(db, 'deposits');
          const paymentQuery = query(
            depositsRef,
            where('paymentIntentId', '==', intent),
            limit(1)
          );
          
          const snapshot = await getDocs(paymentQuery);
          
          if (!snapshot.empty) {
            const depositData = snapshot.docs[0].data();
            setAmount(depositData.amount || 0);
          } else {
            // If we can't find it by direct query, try user's deposits
            if (currentUser) {
              const userDepositsQuery = query(
                depositsRef,
                where('userId', '==', currentUser.uid),
                orderBy('timestamp', 'desc'),
                limit(1)
              );
              
              const userDepositsSnapshot = await getDocs(userDepositsQuery);
              
              if (!userDepositsSnapshot.empty) {
                const recentDeposit = userDepositsSnapshot.docs[0].data();
                setAmount(recentDeposit.amount || 0);
              } else {
                // Fallback to fixed amount 
                setAmount(100);
              }
            } else {
              // Fallback to fixed amount 
              setAmount(100);
            }
          }
        } catch (error) {
          console.error("Error fetching payment details:", error);
          setAmount(100); // Fallback amount
        } finally {
          setLoading(false);
        }
      };
      
      fetchPaymentDetails();
    } else {
      // If there's no payment intent or it didn't succeed, show an error briefly and redirect
      setLoading(false);
      setTimeout(() => router.push('/dashboard'), 3000);
    }
  }, [searchParams, router, currentUser]);
  
  // If we're still loading
  if (loading) {
    return (
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
        <div className="bg-amber-50 p-6 border-b border-amber-100 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-3xl font-dmserif text-amber-800 mb-2">
            Processing...
          </h1>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-6">
            Retrieving your deposit information...
          </p>
        </div>
      </div>
    );
  }
  
  // If redirect_status is not "succeeded"
  if (!searchParams.get('payment_intent') || searchParams.get('redirect_status') !== 'succeeded') {
    return (
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
        <div className="bg-red-50 p-6 border-b border-red-100 text-center">
          <div className="text-red-500 text-5xl mx-auto mb-4">⚠️</div>
          <h1 className="text-3xl font-dmserif text-red-800 mb-2">
            Deposit Not Completed
          </h1>
        </div>
        <div className="p-6 text-center">
          <p className="text-xl text-gray-700 mb-6">
            We couldn&apos;t verify your deposit. You may need to try again.
          </p>
          <Link href="/deposit" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    );
  }
  
  // Success state
  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
      <div className="bg-amber-50 p-6 border-b border-amber-100 text-center">
        <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />
        <h1 className="text-3xl font-dmserif text-amber-800 mb-2">
          Deposit Successful!
        </h1>
      </div>
      
      <div className="p-6 text-center">
        {amount ? (
          <p className="text-xl text-gray-700 mb-6">
            Your deposit of <span className="font-bold">${amount.toFixed(2)}</span> has been 
            received and is being processed.
          </p>
        ) : (
          <p className="text-xl text-gray-700 mb-6">
            Your deposit has been received and is being processed.
          </p>
        )}
        
        <div className="bg-amber-50 rounded-lg p-4 mb-6 text-amber-800">
          <p className="text-sm">
            Funds will be available for investment within 1-2 business days.
            You will receive an email confirmation with details.
          </p>
        </div>
        
        <Link href="/dashboard" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}