"use client";

import { Suspense } from 'react';
import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import DepositSuccessContent from '@/components/deposit-success-content';

export default function DepositSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <Suspense fallback={<LoadingState />}>
        <DepositSuccessContent />
      </Suspense>
    </div>
  );
}

// Loading state component
function LoadingState() {
  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
      <div className="bg-amber-50 p-6 border-b border-amber-100 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-3xl font-dmserif text-amber-800 mb-2">
          Processing...
        </h1>
      </div>
      
      <div className="p-6 text-center">
        <p className="text-xl text-gray-700 mb-6">
          Verifying your deposit...
        </p>
      </div>
    </div>
  );
}