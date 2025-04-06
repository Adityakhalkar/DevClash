from fastapi import FastAPI, HTTPException, Depends, Header, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore, auth
import stripe
from datetime import datetime, timedelta
import uuid
import os
import json
from decimal import Decimal
import uvicorn
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Savium Investment API", description="Backend API for Savium micro-investment platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
try:
    cred = credentials.Certificate("firebase-credentials.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Error initializing Firebase: {e}")

# Initialize Stripe
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY", "sk_test_your_test_key")
stripe.api_key = STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_your_webhook_secret")

# Economic constants (hardcoded)
INFLATION_RATE = 0.025  # 2.5% inflation rate
INTEREST_PREMIUM = 0.015  # 1.5% premium over inflation
ANNUAL_INTEREST_RATE = INFLATION_RATE + INTEREST_PREMIUM  # 4.0% total annual rate
DAILY_INTEREST_RATE = ANNUAL_INTEREST_RATE / 365  # Daily compounding rate

# --- Pydantic Models ---

class UserCreate(BaseModel):
    email: str
    uid: str
    name: Optional[str] = None

class InvestmentCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Investment amount must be greater than 0")
    recurring: bool = False
    frequency: Optional[str] = None  # 'weekly', 'monthly', etc.

class PaymentIntentCreate(BaseModel):
    amount: int = Field(..., gt=100, description="Amount in cents, minimum 100 (1 USD)")
    payment_method_id: Optional[str] = None
    currency: str = "usd"
    description: str = "Savium Investment"

class WithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=0)
    account_id: str

# --- Helper Functions ---

def verify_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None


async def get_current_user(authorization: str = Header(...)):
    """Verify Firebase token and get current user"""
    try:
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication: {str(e)}")

def calculate_investment_returns(principal: float, days: int) -> float:
    """Calculate investment returns based on principal amount and days invested"""
    return principal * ((1 + DAILY_INTEREST_RATE) ** days - 1)

def get_portfolio_value(user_id: str) -> dict:
    """Get current portfolio value and returns for a user"""
    try:
        # Get user's investments from Firestore
        investments_ref = db.collection("investments").where("userId", "==", user_id).stream()
        
        total_invested = 0.0
        current_value = 0.0
        
        for inv in investments_ref:
            inv_data = inv.to_dict()
            amount = inv_data.get("amount", 0)
            timestamp = inv_data.get("timestamp", datetime.now())
            
            # Convert timestamp to datetime if needed
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                
            days_invested = (datetime.now() - timestamp).days
            returns = calculate_investment_returns(amount, days_invested)
            
            total_invested += amount
            current_value += amount + returns
        
        return {
            "total_invested": round(total_invested, 2),
            "current_value": round(current_value, 2),
            "total_returns": round(current_value - total_invested, 2),
            "return_percentage": round(((current_value / total_invested) - 1) * 100, 2) if total_invested > 0 else 0.0,
            "annual_rate": round(ANNUAL_INTEREST_RATE * 100, 2)
        }
    except Exception as e:
        print(f"Error calculating portfolio value: {str(e)}")
        return {
            "total_invested": 0.0,
            "current_value": 0.0,
            "total_returns": 0.0,
            "return_percentage": 0.0,
            "annual_rate": round(ANNUAL_INTEREST_RATE * 100, 2)
        }

async def save_transaction(user_id: str, transaction_type: str, amount: float, status: str, metadata: dict = None):
    """Save transaction to Firestore"""
    transaction_id = str(uuid.uuid4())
    transaction_data = {
        "transactionId": transaction_id,
        "userId": user_id,
        "type": transaction_type,
        "amount": amount,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "metadata": metadata or {}
    }
    
    db.collection("transactions").document(transaction_id).set(transaction_data)
    return transaction_id

# --- API Endpoints ---

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "Savium API is operational", "version": "1.0.0"}

# --- User Management Endpoints ---

@app.post("/api/users")
async def create_user(user: UserCreate):
    """Create or update user profile in Firestore"""
    try:
        # Check if user exists
        user_ref = db.collection("users").document(user.uid)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            # Update last login
            user_ref.update({
                "lastLogin": datetime.now().isoformat()
            })
            return {"message": "User login recorded", "userId": user.uid}
        else:
            # Create new user profile
            user_data = {
                "userId": user.uid,
                "email": user.email,
                "name": user.name,
                "createdAt": datetime.now().isoformat(),
                "lastLogin": datetime.now().isoformat(),
                "accountStatus": "active",
                "investmentProfile": {
                    "riskTolerance": None,
                    "investmentGoals": [],
                    "preferredSectors": []
                },
                "financialInfo": {
                    "accountConnected": False,
                    "totalInvested": 0,
                    "totalReturns": 0,
                    "portfolioValue": 0
                }
            }
            user_ref.set(user_data)
            return {"message": "User created successfully", "userId": user.uid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@app.get("/api/users/me", response_model=Dict[str, Any])
async def get_user_profile(user=Depends(get_current_user)):
    """Get current user's profile"""
    try:
        user_ref = db.collection("users").document(user["uid"]).get()
        if not user_ref.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_ref.to_dict()
        portfolio = get_portfolio_value(user["uid"])
        
        # Update financial information in user profile
        db.collection("users").document(user["uid"]).update({
            "financialInfo.totalInvested": portfolio["total_invested"],
            "financialInfo.totalReturns": portfolio["total_returns"],
            "financialInfo.portfolioValue": portfolio["current_value"]
        })
        
        # Add portfolio data to response
        user_data["portfolio"] = portfolio
        
        return user_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user profile: {str(e)}")

# --- Investment Endpoints ---

@app.post("/api/investments")
async def create_investment(
    investment: InvestmentCreate, 
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user)
):
    """Create a new investment"""
    try:
        investment_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        investment_data = {
            "investmentId": investment_id,
            "userId": user["uid"],
            "amount": investment.amount,
            "timestamp": timestamp,
            "status": "pending",
            "recurring": investment.recurring,
            "frequency": investment.frequency,
            "nextRecurringDate": (datetime.now() + timedelta(days=30)).isoformat() if investment.recurring else None
        }
        
        # Save investment
        db.collection("investments").document(investment_id).set(investment_data)
        
        # Record transaction
        background_tasks.add_task(
            save_transaction, 
            user["uid"], 
            "investment", 
            investment.amount, 
            "pending",
            {"investmentId": investment_id}
        )
        
        return {
            "message": "Investment created successfully",
            "investmentId": investment_id,
            "paymentRequired": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating investment: {str(e)}")

@app.get("/api/investments")
async def get_investments(user=Depends(get_current_user)):
    """Get all investments for current user"""
    try:
        investments_ref = db.collection("investments").where("userId", "==", user["uid"]).stream()
        
        investments = []
        for inv in investments_ref:
            inv_data = inv.to_dict()
            
            # Calculate current value and returns
            amount = inv_data.get("amount", 0)
            timestamp = inv_data.get("timestamp")
            
            if timestamp:
                if isinstance(timestamp, str):
                    inv_timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                else:
                    inv_timestamp = timestamp
                    
                days_invested = (datetime.now() - inv_timestamp).days
                returns = calculate_investment_returns(amount, days_invested)
                current_value = amount + returns
                
                inv_data["currentValue"] = round(current_value, 2)
                inv_data["returns"] = round(returns, 2)
                inv_data["daysInvested"] = days_invested
            
            investments.append(inv_data)
            
        return {"investments": investments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching investments: {str(e)}")

@app.get("/api/portfolio")
async def get_user_portfolio(user=Depends(get_current_user)):
    """Get user's portfolio summary"""
    try:
        portfolio = get_portfolio_value(user["uid"])
        
        # Update user's financial info
        db.collection("users").document(user["uid"]).update({
            "financialInfo.totalInvested": portfolio["total_invested"],
            "financialInfo.totalReturns": portfolio["total_returns"],
            "financialInfo.portfolioValue": portfolio["current_value"]
        })
        
        return portfolio
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching portfolio: {str(e)}")

# --- Payment Endpoints ---

@app.post("/api/payments/create-intent")
async def create_payment_intent(
    payment_data: PaymentIntentCreate, 
    user=Depends(get_current_user)
):
    """Create a Stripe payment intent"""
    try:
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=payment_data.amount,  # Amount in cents
            currency=payment_data.currency,
            description=payment_data.description,
            metadata={
                "userId": user["uid"],
                "email": user.get("email", ""),
            },
            payment_method=payment_data.payment_method_id,
            confirmation_method="manual",
            confirm=True if payment_data.payment_method_id else False,
        )
        
        return {
            "clientSecret": intent.client_secret,
            "paymentIntentId": intent.id,
            "status": intent.status
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")

@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle Stripe webhook events
    
    This endpoint receives events from Stripe about payment status changes,
    subscription updates, and other important account notifications.
    """
    # Get the webhook payload and signature header
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing Stripe signature header")
    
    try:
        # Verify the event came from Stripe using signature verification
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        
        # Extract the event type and data
        event_type = event["type"]
        event_data = event["data"]["object"]
        
        print(f"Processing Stripe webhook: {event_type}")
        
        # Check if we've already processed this event to avoid duplicates
        event_id = event["id"]
        webhook_event_ref = db.collection("webhookEvents").document(event_id)
        webhook_doc = webhook_event_ref.get()
        
        if webhook_doc.exists:
            print(f"Webhook event {event_id} already processed, skipping")
            return {"status": "success", "message": "Event already processed"}
        
        # Store event in database to prevent duplicate processing
        webhook_event_ref.set({
            "eventId": event_id,
            "type": event_type,
            "processedAt": datetime.now().isoformat(),
            "data": json.loads(json.dumps(event_data))  # Convert to JSON-serializable format
        })
        
        # Handle different event types
        if event_type == "payment_intent.succeeded":
            # Handle successful payments
            await handle_successful_payment(event_data, background_tasks)
        elif event_type == "payment_intent.payment_failed":
            # Handle failed payments
            await handle_failed_payment(event_data, background_tasks)
            
        elif event_type == "charge.succeeded":
            # Handle successful charges (for one-time payments)
            await handle_successful_payment(event_data, background_tasks)
        elif event_type == "charge.refunded":
            # Handle refunds
            await handle_refund(event_data, background_tasks)
            
        elif event_type == "customer.subscription.created":
            # Handle new subscriptions (for recurring investments)
            await handle_subscription_created(event_data, background_tasks)
            
        elif event_type == "customer.subscription.updated":
            # Handle subscription updates
            await handle_subscription_updated(event_data, background_tasks)
            
        elif event_type == "customer.subscription.deleted":
            # Handle subscription cancellations
            await handle_subscription_cancelled(event_data, background_tasks)
            
        # Add other event types as needed
        
        return {"status": "success", "eventType": event_type}
        
    except stripe.error.SignatureVerificationError:
        # Invalid signature - this request didn't come from Stripe
        print("⚠️ Invalid Stripe signature")
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except json.JSONDecodeError:
        # Invalid JSON payload
        print("⚠️ Invalid JSON in webhook payload")
        raise HTTPException(status_code=400, detail="Invalid webhook payload")
    except Exception as e:
        # Log the error but return 200 to Stripe
        # Stripe will retry the webhook if we return an error status
        print(f"⚠️ Error processing webhook: {str(e)}")
        # Store the failed event
        error_id = str(uuid.uuid4())
        db.collection("webhookErrors").document(error_id).set({
            "errorId": error_id,
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "payload": payload.decode("utf-8"),
            "signature": sig_header
        })
        # Return 200 to acknowledge receipt
        return {"status": "error", "message": "Error processing webhook, but request received"}

# --- Webhook Handler Functions ---

async def handle_successful_payment(payment_intent, background_tasks):
    """Handle successful payment events"""
    try:
        # Extract data
        user_id = payment_intent["metadata"].get("userId")
        if not user_id:
            print("⚠️ No userId in payment metadata")
            return
            
        amount = payment_intent["amount"] / 100  # Convert cents to dollars/rupees
        payment_id = payment_intent["id"]
        payment_method = payment_intent.get("payment_method")
        payment_purpose = payment_intent["metadata"].get("purpose")
        
        # Handle deposit specifically
        if payment_purpose == "account_deposit":
            # Update deposit status
            deposits_ref = db.collection("deposits").where("paymentIntentId", "==", payment_id).limit(1)
            deposits = list(deposits_ref.stream())
            
            if deposits:
                deposit_doc = deposits[0]
                deposit_ref = db.collection("deposits").document(deposit_doc.id)
                
                # Mark deposit as completed
                deposit_ref.update({
                    "status": "completed",
                    "completedAt": datetime.now().isoformat(),
                })
                
                # Update user's financial info for the deposit
                user_ref = db.collection("users").document(user_id)
                user_doc = user_ref.get()
                
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    current_invested = user_data.get("financialInfo", {}).get("totalInvested", 0)
                    current_portfolio = user_data.get("financialInfo", {}).get("portfolioValue", 0)
                    
                    # Update both totalInvested and portfolioValue
                    user_ref.update({
                        "financialInfo.totalInvested": current_invested + amount,
                        "financialInfo.portfolioValue": current_portfolio + amount,
                        "financialInfo.accountConnected": True,
                        "financialInfo.lastDepositDate": datetime.now().isoformat()
                    })
                    
                    print(f"✅ User financial info updated for deposit: {payment_id}")
            else:
                print(f"⚠️ No deposit found for paymentIntentId: {payment_id}")
            
            # Record transaction
            background_tasks.add_task(
                save_transaction, 
                user_id, 
                "deposit", 
                amount, 
                "completed",
                {
                    "paymentIntentId": payment_id,
                    "paymentMethod": payment_method,
                    "description": payment_intent.get("description", "Account deposit")
                }
            )
            
        # If investment payment, handle it (existing logic)
        elif payment_intent["metadata"].get("investmentId"):
            investment_id = payment_intent["metadata"].get("investmentId")
            # Rest of your existing investment handling code...
            inv_ref = db.collection("investments").document(investment_id)
            inv_doc = inv_ref.get()
            
            if inv_doc.exists:
                # Mark investment as active
                inv_ref.update({
                    "status": "active",
                    "paymentId": payment_id,
                    "paymentTimestamp": datetime.now().isoformat(),
                    "paymentDetails": {
                        "amount": amount,
                        "currency": payment_intent["currency"],
                        "paymentMethod": payment_method,
                        "paymentIntentId": payment_id
                    }
                })
                
                # Update user's financial info
                user_ref = db.collection("users").document(user_id)
                user_doc = user_ref.get()
                
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    current_invested = user_data.get("financialInfo", {}).get("totalInvested", 0)
                    current_portfolio = user_data.get("financialInfo", {}).get("portfolioValue", 0)
                    
                    user_ref.update({
                        "financialInfo.totalInvested": current_invested + amount,
                        "financialInfo.portfolioValue": current_portfolio + amount,
                        "financialInfo.lastInvestmentDate": datetime.now().isoformat()
                    })
            
                # Record transaction (existing code)
                background_tasks.add_task(
                    save_transaction, 
                    user_id, 
                    "payment", 
                    amount, 
                    "completed",
                    {
                        "paymentIntentId": payment_id,
                        "paymentMethod": payment_method,
                        "investmentId": investment_id,
                        "description": payment_intent.get("description", "Investment payment")
                    }
                )
        else:
            # Generic payment without specific purpose
            print(f"⚠️ Payment without specific purpose: {payment_id}")
            
            # Still record the transaction for auditing
            background_tasks.add_task(
                save_transaction, 
                user_id, 
                "payment", 
                amount, 
                "completed",
                {
                    "paymentIntentId": payment_id,
                    "paymentMethod": payment_method,
                    "description": payment_intent.get("description", "Unknown payment")
                }
            )
        
        print(f"✅ Successful payment processed: {payment_id}")
        
    except Exception as e:
        print(f"⚠️ Error processing successful payment: {str(e)}")
        # Log error but don't re-raise - we want to acknowledge receipt to Stripe

async def handle_failed_payment(payment_intent, background_tasks):
    """Handle failed payment events"""
    try:
        # Extract data
        user_id = payment_intent["metadata"].get("userId")
        if not user_id:
            print("⚠️ No userId in payment metadata")
            return
            
        amount = payment_intent["amount"] / 100
        payment_id = payment_intent["id"]
        
        # Get error details
        error = payment_intent.get("last_payment_error", {})
        error_message = error.get("message", "Unknown error")
        error_code = error.get("code", "unknown")
        
        # Check if this payment is associated with an investment
        investment_id = payment_intent["metadata"].get("investmentId")
        if investment_id:
            # Update investment status
            db.collection("investments").document(investment_id).update({
                "status": "failed",
                "failureReason": error_message,
                "failureCode": error_code,
                "lastAttempt": datetime.now().isoformat()
            })
        
        # Record transaction
        background_tasks.add_task(
            save_transaction, 
            user_id, 
            "payment", 
            amount, 
            "failed",
            {
                "paymentIntentId": payment_id,
                "failureReason": error_message,
                "failureCode": error_code,
                "investmentId": investment_id
            }
        )
        
        print(f"❌ Failed payment processed: {payment_id} - {error_message}")
        
    except Exception as e:
        print(f"⚠️ Error processing failed payment: {str(e)}")

async def handle_refund(charge, background_tasks):
    """Handle refund events"""
    try:
        # Extract data
        payment_intent_id = charge.get("payment_intent")
        if not payment_intent_id:
            print("⚠️ No payment_intent in charge data")
            return
            
        # Retrieve the payment intent to get metadata
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        user_id = payment_intent.metadata.get("userId")
        
        if not user_id:
            print("⚠️ No userId in payment metadata")
            return
            
        amount = charge["amount_refunded"] / 100  # Refunded amount in dollars
        
        # Check if this payment is associated with an investment
        investment_id = payment_intent.metadata.get("investmentId")
        if investment_id:
            # Mark investment as refunded
            db.collection("investments").document(investment_id).update({
                "status": "refunded",
                "refundedAt": datetime.now().isoformat(),
                "refundAmount": amount
            })
            
            # Update user's financial info
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                current_invested = user_data.get("financialInfo", {}).get("totalInvested", 0)
                
                # Reduce total invested amount
                user_ref.update({
                    "financialInfo.totalInvested": max(0, current_invested - amount)
                })
        
        # Record transaction
        background_tasks.add_task(
            save_transaction, 
            user_id, 
            "refund", 
            amount, 
            "completed",
            {
                "paymentIntentId": payment_intent_id,
                "chargeId": charge["id"],
                "refundId": charge["refunds"]["data"][0]["id"] if charge.get("refunds", {}).get("data") else None,
                "investmentId": investment_id
            }
        )
        
        print(f"💰 Refund processed: {charge['id']}")
        
    except Exception as e:
        print(f"⚠️ Error processing refund: {str(e)}")

async def handle_subscription_created(subscription, background_tasks):
    """Handle subscription created events (for recurring investments)"""
    try:
        # Extract customer and metadata
        customer_id = subscription.get("customer")
        if not customer_id:
            print("⚠️ No customer in subscription data")
            return
            
        # Retrieve customer to get user ID from metadata
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.metadata.get("userId")
        
        if not user_id:
            print("⚠️ No userId in customer metadata")
            return
        
        # Subscription details
        amount = subscription["items"]["data"][0]["price"]["unit_amount"] / 100
        interval = subscription["items"]["data"][0]["price"]["recurring"]["interval"]
        subscription_id = subscription["id"]
        
        # Create recurring investment record
        investment_id = str(uuid.uuid4())
        investment_data = {
            "investmentId": investment_id,
            "userId": user_id,
            "amount": amount,
            "timestamp": datetime.now().isoformat(),
            "status": "active",
            "recurring": True,
            "frequency": interval,
            "subscriptionId": subscription_id,
            "nextPaymentDate": datetime.fromtimestamp(subscription["current_period_end"]).isoformat()
        }
        
        db.collection("investments").document(investment_id).set(investment_data)
        
        # Record transaction
        background_tasks.add_task(
            save_transaction, 
            user_id, 
            "subscription_started", 
            amount, 
            "completed",
            {
                "subscriptionId": subscription_id,
                "investmentId": investment_id,
                "frequency": interval,
                "customerId": customer_id
            }
        )
        
        print(f"🔄 Subscription created: {subscription_id}")
        
    except Exception as e:
        print(f"⚠️ Error processing subscription creation: {str(e)}")

async def handle_subscription_updated(subscription, background_tasks):
    """Handle subscription updated events"""
    # Implementation similar to subscription created
    pass

async def handle_subscription_cancelled(subscription, background_tasks):
    """Handle subscription cancelled events"""
    # Implementation similar to subscription created, but update status to cancelled
    pass

@app.post("/api/withdrawals")
async def request_withdrawal(
    withdrawal: WithdrawalRequest, 
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user)
):
    """Request a withdrawal from investment account"""
    try:
        # Get user's portfolio value
        portfolio = get_portfolio_value(user["uid"])
        
        # Check if user has enough funds
        if withdrawal.amount > portfolio["current_value"]:
            raise HTTPException(status_code=400, detail="Insufficient funds for withdrawal")
        
        # Create withdrawal record
        withdrawal_id = str(uuid.uuid4())
        withdrawal_data = {
            "withdrawalId": withdrawal_id,
            "userId": user["uid"],
            "amount": withdrawal.amount,
            "accountId": withdrawal.account_id,
            "status": "pending",
            "requestedAt": datetime.now().isoformat()
        }
        
        db.collection("withdrawals").document(withdrawal_id).set(withdrawal_data)
        
        # Record transaction
        background_tasks.add_task(
            save_transaction, 
            user["uid"], 
            "withdrawal", 
            withdrawal.amount, 
            "pending",
            {"withdrawalId": withdrawal_id}
        )
        
        return {
            "message": "Withdrawal request submitted successfully",
            "withdrawalId": withdrawal_id,
            "status": "pending",
            "estimatedProcessingTime": "3-5 business days"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing withdrawal: {str(e)}")

@app.get("/api/transactions")
async def get_transactions(user=Depends(get_current_user)):
    """Get transaction history for current user"""
    try:
        transactions_ref = db.collection("transactions").where("userId", "==", user["uid"]).stream()
        
        transactions = []
        for tx in transactions_ref:
            transactions.append(tx.to_dict())
            
        # Sort by timestamp (newest first)
        transactions.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return {"transactions": transactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")

@app.post("/api/deposit")
async def deposit(request: Request, authorization: str = Header(None)):
    # 🔐 Token check
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split("Bearer ")[1]
    decoded = verify_token(token)
    if not decoded:
        raise HTTPException(status_code=403, detail="Invalid or expired token")

    user_id = decoded["uid"]

    # Parse request body
    body = await request.json()
    amount = body.get("amount")
    currency = body.get("currency", "inr")  # Default to INR for Indian Rupees
    description = body.get("description", "Account deposit")

    # Validate minimum amount (₹100 in paise = 10000)
    if not amount or amount < 10000:
        return JSONResponse(status_code=400, content={"error": "Minimum deposit amount is ₹100"})

    try:
        # Check if Stripe API key is set properly
        if not stripe.api_key or stripe.api_key == "sk_test_your_test_key":
            print("⚠️ WARNING: Using default/placeholder Stripe API key. Set STRIPE_API_KEY environment variable.")
            return JSONResponse(
                status_code=500, 
                content={"error": "Stripe not properly configured. Please contact support."}
            )
            
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            description=description,
            metadata={
                "userId": user_id,
                "purpose": "account_deposit"
            },
            automatic_payment_methods={
                "enabled": True
            }
        )
        
        # Record the pending deposit in Firestore
        deposit_id = str(uuid.uuid4())
        deposit_data = {
            "depositId": deposit_id,
            "userId": user_id,
            "amount": amount / 100,  # Convert back to rupees for storage
            "currency": currency,
            "status": "pending",
            "createdAt": datetime.now().isoformat(),
            "paymentIntentId": intent.id,
            "description": description
        }
        
        db.collection("deposits").document(deposit_id).set(deposit_data)
        
        return {
            "clientSecret": intent.client_secret,
            "paymentIntentId": intent.id
        }

    except stripe.error.AuthenticationError as e:
        # Handle invalid API key errors specifically
        print(f"⚠️ Stripe authentication error: {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"error": "Invalid Stripe API key. Please contact support."}
        )
    except stripe.error.StripeError as e:
        # Handle other Stripe-specific errors
        print(f"⚠️ Stripe error: {str(e)}")
        return JSONResponse(
            status_code=400, 
            content={"error": f"Payment service error: {str(e)}"}
        )
    except Exception as e:
        # Handle generic errors
        print(f"⚠️ Error creating payment intent: {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"error": f"An unexpected error occurred: {str(e)}"}
        )