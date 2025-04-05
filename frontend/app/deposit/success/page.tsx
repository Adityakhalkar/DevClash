"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, CircleCheck } from 'lucide-react';
import Link from 'next/link';

export default function DepositSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  
  useEffect(() => {
    // Get payment_intent and redirect_status from URL
    const intent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    
    if (intent) {
      setPaymentIntent(intent);
      
      // In a real app, you would fetch the payment details from your API
      // For demo purposes, we'll show a fixed amount
      setAmount(100);
      
      // Record successful payment in Firestore
      // This would typically be handled by your webhook
    }
    
    // Redirect if no payment intent or failed payment
    if (!intent || redirectStatus !== 'succeeded') {
      setTimeout(() => router.push('/dashboard'), 3000);
    }
  }, [searchParams]);
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
        <div className="bg-amber-50 p-6 border-b border-amber-100 text-center">
          <CheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
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
    </div>
  );
}