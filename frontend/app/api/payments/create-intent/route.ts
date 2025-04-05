import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Parse request body
    const body = await req.json();
    const { amount, currency = 'usd', description } = body;
    
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum deposit is $1.00' }, 
        { status: 400 }
      );
    }
    
    // Forward request to backend with the token
    const response = await fetch(`${BACKEND_API_URL}/api/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        currency,
        description
      })
    });
    
    // Get response from backend
    const data = await response.json();
    
    // If backend returned an error
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Error creating payment' },
        { status: response.status }
      );
    }
    
    // Return the payment intent details from the backend
    return NextResponse.json({
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId
    });
    
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' }, 
      { status: 500 }
    );
  }
}