"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

// Constants for interest rate calculations
const INFLATION_RATE = 0.06; // 6%
const INTEREST_PREMIUM = 0.02; // 2%
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  CreditCard,
  Clock,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function DepositPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [amount, setAmount] = useState(slug ? parseFloat(slug as string) : 100);
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showCustomAmount, setShowCustomAmount] = useState(false);

  // Predefined amounts in rupees
  const predefinedAmounts = [100, 500, 1000, 5000, 10000];

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login?redirect=deposit');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Update amount when slug changes
  useEffect(() => {
    if (slug) {
      const parsedAmount = parseFloat(slug as string);
      if (!isNaN(parsedAmount) && parsedAmount >= 100) {
        setAmount(parsedAmount);
      }
    }
  }, [slug]);

  // Create payment intent on the server
  const createPaymentIntent = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Ensure minimum amount is ₹100
      if (amount < 100) {
        setErrorMessage("Minimum deposit amount is ₹100");
        return;
      }
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Create the payment intent via our backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise (Indian cents)
          currency: "inr", // Indian Rupee
          description: `Deposit of ₹${amount.toFixed(2)} to investment account`
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to create payment');
      }
      
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setErrorMessage(error.message || 'An error occurred while setting up payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle amount selection
  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setShowCustomAmount(false);
    setCustomAmount("");
  };

  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setAmount(numValue);
    }
  };

  // Handle proceed button click
  const handleProceed = () => {
    createPaymentIntent();
  };

  // Appearance options for Stripe Elements
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#F5BF03',
      colorBackground: '#ffffff',
      colorText: '#422F00',
      colorDanger: '#ef4444',
      fontFamily: 'DM Serif Display, system-ui, sans-serif',
      borderRadius: '8px',
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-amber-50 border-b border-amber-100">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-amber-800 hover:text-amber-600">
            <ArrowLeft className="mr-2" size={18} />
            <span className="font-dmserif">Back to Dashboard</span>
          </Link>
          <div className="text-2xl font-dmserif text-amber-800">Savium</div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <h1 className="text-4xl font-dmserif text-amber-800 mb-8 text-center">
          Deposit Funds
        </h1>
        
        {clientSecret ? (
          // Show payment form once we have the client secret
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
            <div className="bg-amber-50 p-6 border-b border-amber-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-dmserif text-amber-800">Deposit Amount</h3>
                <span className="text-2xl font-dmserif text-amber-800">₹{amount.toFixed(2)}</span>
              </div>
              <p className="text-amber-700 text-sm">
                Funds will be available for investment within 1-2 business days
              </p>
            </div>
            
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance,
                locale: 'en',
              }}
            >
              <CheckoutForm amount={amount} user={user} />
            </Elements>
          </div>
        ) : (
          // Show amount selection form
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
            <div className="bg-amber-50 p-6 border-b border-amber-100">
              <h3 className="text-xl font-dmserif text-amber-800 mb-2">Select Deposit Amount</h3>
              <p className="text-amber-700 text-sm">
                Choose how much you'd like to add to your investment account
              </p>
            </div>
            
            <div className="p-6">
              {/* Error message */}
              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
                  <AlertCircle className="mr-2 flex-shrink-0" size={20} />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {/* Predefined amounts */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {predefinedAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    className={`p-4 rounded-lg border text-black ${
                      amount === presetAmount && !showCustomAmount
                        ? 'bg-amber-100 border-amber-300'
                        : 'bg-white border-amber-100 hover:bg-amber-50'
                    } transition-colors font-dmserif`}
                    onClick={() => handleAmountSelect(presetAmount)}
                  >
                    ₹{presetAmount.toLocaleString()}
                  </button>
                ))}
                
                <button
                  className={`p-4 rounded-lg border text-black ${
                    showCustomAmount
                      ? 'bg-amber-100 border-amber-300'
                      : 'bg-white border-amber-100 hover:bg-amber-50'
                  } transition-colors font-dmserif`}
                  onClick={() => setShowCustomAmount(true)}
                >
                  Custom
                </button>
              </div>
              
              {/* Custom amount input */}
              {showCustomAmount && (
                <div className="mb-6">
                  <label className="block text-amber-800 font-dmserif mb-2">
                    Enter Amount (Min ₹100)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="w-full pl-8 pr-4 text-black py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter amount"
                      autoFocus
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-amber-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-1 text-amber-800">
                  <span>Amount to Deposit</span>
                  <span className="font-bold">₹{amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-amber-700 text-sm">
                  <span>Processing Fee</span>
                  <span>₹0.00</span>
                </div>
              </div>
              
              <button
                onClick={handleProceed}
                disabled={loading || amount < 100}
                className="w-full bg-amber-500 text-white py-4 rounded-lg font-dmserif text-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 animate-spin">
                      <Clock size={18} />
                    </span>
                    Processing...
                  </span>
                ) : (
                  `Proceed to Payment`
                )}
              </button>
              
              <div className="mt-4 text-center text-amber-700 text-sm flex items-center justify-center">
                <Image src="/secure-badge.svg" alt="Secure Payment" width={16} height={16} className="mr-2" />
                100% secure payment processed by Stripe
              </div>
            </div>
          </div>
        )}
        
        {/* Investment Benefits */}
        <div className="mt-12">
          <h2 className="text-2xl font-dmserif text-amber-800 mb-6 text-center">
            Why Deposit with Savium?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                ₹
              </div>
              <h3 className="text-lg font-dmserif text-amber-800 text-center mb-2">Higher Returns</h3>
              <p className="text-center text-gray-600 text-sm">
                Earn {((INFLATION_RATE + INTEREST_PREMIUM) * 100).toFixed(1)}% annually, 
                beating traditional bank savings accounts
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock className="text-amber-600" size={24} />
              </div>
              <h3 className="text-lg font-dmserif text-amber-800 text-center mb-2">Daily Compounding</h3>
              <p className="text-center text-gray-600 text-sm">
                Interest calculated daily, maximizing your investment growth
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="text-amber-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="text-lg font-dmserif text-amber-800 text-center mb-2">Flexible Withdrawals</h3>
              <p className="text-center text-gray-600 text-sm">
                Access your funds within 1-2 business days when you need them
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Checkout form component
function CheckoutForm({ amount, user }: { amount: number, user: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Customer information required for Indian regulations
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN", // Default to India
  });
  const [showBillingDetails, setShowBillingDetails] = useState(true);

  // Handle customer info changes
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  // Validate required fields
  const validateForm = () => {
    const requiredFields = ["name", "addressLine1", "city", "state", "postalCode"];
    for (const field of requiredFields) {
      if (!customerInfo[field as keyof typeof customerInfo]) {
        setErrorMessage(`Please provide your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate customer info
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe including billing details
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/deposit/success`,
          payment_method_data: {
            billing_details: {
              name: customerInfo.name,
              address: {
                line1: customerInfo.addressLine1,
                city: customerInfo.city,
                state: customerInfo.state,
                postal_code: customerInfo.postalCode,
                country: customerInfo.country,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Show error
        setErrorMessage(result.error.message || 'Payment failed. Please try again.');
      } else {
        // Payment succeeded
        setSuccess(true);
        
        // Save deposit record to Firestore
        const depositId = crypto.randomUUID();
        await setDoc(doc(db, "deposits", depositId), {
          userId: user.uid,
          amount: amount,
          currency: "inr",
          status: 'completed',
          timestamp: serverTimestamp(),
          paymentIntentId: result.paymentIntent?.id,
          customerInfo: {
            name: customerInfo.name,
            address: {
              line1: customerInfo.addressLine1,
              city: customerInfo.city,
              state: customerInfo.state,
              postalCode: customerInfo.postalCode,
              country: customerInfo.country,
            }
          },
          metadata: {
            browser: navigator.userAgent,
            source: 'deposit_page'
          }
        });
        
        // Redirect after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center">
        <CheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-dmserif text-green-700 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your deposit of ₹{amount.toFixed(2)} has been received and is being processed.
        </p>
        <Link href="/dashboard" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Billing Information - Required for Indian regulations */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-amber-800 font-dmserif">Billing Information</h3>
          <button
            type="button"
            onClick={() => setShowBillingDetails(!showBillingDetails)}
            className="text-amber-600 text-sm hover:underline focus:outline-none"
          >
            {showBillingDetails ? 'Hide details' : 'Show details'}
          </button>
        </div>
        
        {showBillingDetails && (
          <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-100">
            <p className="text-sm text-amber-800 mb-3">
              <AlertCircle className="inline mr-2" size={16} />
              As per Indian regulations, we need your billing details for this transaction.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-amber-800 text-sm mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInfoChange}
                  className="w-full px-4 py-2 text-black border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-amber-800 text-sm mb-1">
                  Address Line *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={customerInfo.addressLine1}
                  onChange={handleInfoChange}
                  className="w-full px-4 py-2 text-black border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-800 text-sm mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInfoChange}
                    className="w-full px-4 py-2 text-black border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-amber-800 text-sm mb-1">
                    State *
                  </label>
                  <select
                    name="state"
                    value={customerInfo.state}
                    onChange={handleInfoChange}
                    className="w-full px-4 py-2 text-black border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select State</option>
                    <option value="AP">Andhra Pradesh</option>
                    <option value="AR">Arunachal Pradesh</option>
                    <option value="AS">Assam</option>
                    <option value="BR">Bihar</option>
                    <option value="CT">Chhattisgarh</option>
                    <option value="GA">Goa</option>
                    <option value="GJ">Gujarat</option>
                    <option value="HR">Haryana</option>
                    <option value="HP">Himachal Pradesh</option>
                    <option value="JH">Jharkhand</option>
                    <option value="KA">Karnataka</option>
                    <option value="KL">Kerala</option>
                    <option value="MP">Madhya Pradesh</option>
                    <option value="MH">Maharashtra</option>
                    <option value="MN">Manipur</option>
                    <option value="ML">Meghalaya</option>
                    <option value="MZ">Mizoram</option>
                    <option value="NL">Nagaland</option>
                    <option value="OR">Odisha</option>
                    <option value="PB">Punjab</option>
                    <option value="RJ">Rajasthan</option>
                    <option value="SK">Sikkim</option>
                    <option value="TN">Tamil Nadu</option>
                    <option value="TG">Telangana</option>
                    <option value="TR">Tripura</option>
                    <option value="UT">Uttarakhand</option>
                    <option value="UP">Uttar Pradesh</option>
                    <option value="WB">West Bengal</option>
                    <option value="AN">Andaman and Nicobar Islands</option>
                    <option value="CH">Chandigarh</option>
                    <option value="DN">Dadra and Nagar Haveli and Daman and Diu</option>
                    <option value="DL">Delhi</option>
                    <option value="JK">Jammu and Kashmir</option>
                    <option value="LA">Ladakh</option>
                    <option value="LD">Lakshadweep</option>
                    <option value="PY">Puducherry</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-800 text-sm mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={customerInfo.postalCode}
                    onChange={handleInfoChange}
                    className="w-full px-4 py-2 text-black border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    title="Please enter a valid 6-digit Indian postal code"
                  />
                </div>
                
                <div>
                  <label className="block text-amber-800 text-sm mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value="India"
                    className="w-full px-4 py-2 text-black bg-gray-100 border border-amber-200 rounded-lg"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Element */}
      <div className="mb-6">
        <label className="block text-amber-800 font-dmserif mb-2">
          <CreditCard className="inline mr-2" size={18} />
          Payment Details
        </label>
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <PaymentElement />
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="mr-2 flex-shrink-0" size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-amber-500 text-white py-4 rounded-lg font-dmserif text-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="mr-2 animate-spin">
              <Clock size={18} />
            </span>
            Processing...
          </span>
        ) : (
          `Pay ₹${amount.toFixed(2)}`
        )}
      </button>
      
      <div className="mt-4 text-center text-amber-700 text-sm flex items-center justify-center">
        <Image src="/secure-badge.svg" alt="Secure Payment" width={16} height={16} className="mr-2" />
        100% secure payment processed by Stripe
      </div>
    </form>
  );
}