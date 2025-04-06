# main.py
import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

import firebase_admin
from firebase_admin import credentials, firestore, auth
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import random
import os
from firebase_admin import credentials

# Construct the absolute path to the credentials file
cred_path = os.path.join(os.path.dirname(__file__), "firebase-credentials.json")

# Initialize Firebase credentials
cred = credentials.Certificate(cred_path)

# Initialize Firebase
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize FastAPI app
app = FastAPI(title="Banking Simulator API")

# Security setup
security = HTTPBearer()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class User(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None

class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class UserRegistrationResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    token: str

class Account(BaseModel):
    account_id: str
    balance: float
    name: str
    type: str
    subtype: str
    
class Transaction(BaseModel):
    transaction_id: str
    account_id: str
    amount: float
    date: str
    name: str
    category: Optional[List[str]] = None
    pending: bool = False

class CreateTransactionRequest(BaseModel):
    account_id: str
    amount: float
    name: str
    category: Optional[List[str]] = None

class SavingsGoal(BaseModel):
    goal_id: str
    name: str
    target_amount: float
    current_amount: float
    target_date: str
    
class CreateSavingsGoalRequest(BaseModel):
    name: str
    target_amount: float
    target_date: str

# Helper functions
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Get the Firebase ID token from the authorization header
        token = credentials.credentials
        
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # Get user from Firestore
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            # User document doesn't exist yet, create it
            user_info = auth.get_user(uid)
            user_data = {
                "uid": uid,
                "email": user_info.email,
                "display_name": user_info.display_name,
                "created_at": datetime.now().isoformat()
            }
            db.collection("users").document(uid).set(user_data)
            return User(**user_data)
        
        return User(**user_doc.to_dict())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_mock_transaction(account_id: str):
    # Generate realistic mock transaction data
    merchants = [
        "Grocery Store", "Coffee Shop", "Gas Station", "Restaurant", 
        "Online Store", "Utility Bill", "Subscription Service",
        "Department Store", "Pharmacy", "Electronics Shop"
    ]
    
    categories = {
        "Grocery Store": ["food", "grocery"],
        "Coffee Shop": ["food and drink", "coffee"],
        "Gas Station": ["transportation", "gas"],
        "Restaurant": ["food and drink", "restaurants"],
        "Online Store": ["shopping", "online"],
        "Utility Bill": ["bills", "utilities"],
        "Subscription Service": ["entertainment", "subscription"],
        "Department Store": ["shopping", "retail"],
        "Pharmacy": ["health", "pharmacy"],
        "Electronics Shop": ["shopping", "electronics"]
    }
    
    merchant = random.choice(merchants)
    amount = round(random.uniform(1.0, 200.0), 2)
    
    # Randomly decide if it's a debit (negative) or credit (positive)
    # Most transactions are debits (spending)
    if random.random() < 0.8:
        amount = -amount
    
    return {
        "transaction_id": str(uuid.uuid4()),
        "account_id": account_id,
        "amount": amount,
        "date": (datetime.now() - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d"),
        "name": merchant,
        "category": categories.get(merchant, ["uncategorized"]),
        "pending": random.random() < 0.1,  # 10% chance of being pending
    }

def generate_mock_account():
    account_types = [
        {"type": "depository", "subtype": "checking", "name": "Checking Account"},
        {"type": "depository", "subtype": "savings", "name": "Savings Account"},
        {"type": "credit", "subtype": "credit card", "name": "Credit Card"},
        {"type": "investment", "subtype": "brokerage", "name": "Investment Account"},
    ]
    
    account_choice = random.choice(account_types)
    
    # Different balance ranges based on account type
    balance_ranges = {
        "checking": (500, 5000),
        "savings": (1000, 20000),
        "credit card": (-5000, 5000),
        "brokerage": (5000, 50000)
    }
    
    min_bal, max_bal = balance_ranges.get(account_choice["subtype"], (0, 1000))
    balance = round(random.uniform(min_bal, max_bal), 2)
    
    return {
        "account_id": str(uuid.uuid4()),
        "balance": balance,
        "name": account_choice["name"],
        "type": account_choice["type"],
        "subtype": account_choice["subtype"],
    }

# New endpoint for user registration
@app.post("/api/register", response_model=UserRegistrationResponse)
async def register_user(user_data: UserRegistration):
    """
    Register a new user using Firebase Authentication.
    """
    try:
        # Create a new user with Firebase Auth
        user = auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name
        )
        
        # Create a custom token for the new user
        custom_token = auth.create_custom_token(user.uid)
        
        # Store user data in Firestore
        user_data_dict = {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "created_at": datetime.now().isoformat()
        }
        db.collection("users").document(user.uid).set(user_data_dict)
        
        # Return user info and token
        return UserRegistrationResponse(
            uid=user.uid,
            email=user.email,
            display_name=user.display_name,
            token=custom_token.decode('utf-8')
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

# Existing endpoints
@app.post("/api/initialize-user", response_model=User)
async def initialize_user(current_user: User = Depends(get_current_user)):
    """
    Initialize user data for first-time users.
    Firebase Auth handles the actual user creation.
    This endpoint creates sample accounts and data for a new user.
    """
    
    # Check if user already has accounts
    accounts_ref = db.collection("accounts").where("uid", "==", current_user.uid)
    existing_accounts = list(accounts_ref.limit(1).stream())
    
    if not existing_accounts:
        # Create some initial mock accounts for the new user
        for _ in range(random.randint(2, 4)):
            account = generate_mock_account()
            account["uid"] = current_user.uid
            account_ref = db.collection("accounts").document()
            account_ref.set(account)
            account_id = account_ref.id
            
            # Generate some initial transactions
            for _ in range(random.randint(5, 15)):
                transaction = generate_mock_transaction(account_id)
                transaction["uid"] = current_user.uid
                db.collection("transactions").add(transaction)
    
    return current_user

@app.get("/api/accounts", response_model=List[Account])
async def get_accounts(current_user: User = Depends(get_current_user)):
    accounts_ref = db.collection("accounts").where("uid", "==", current_user.uid)
    accounts = []
    
    for doc in accounts_ref.stream():
        account_data = doc.to_dict()
        account_data["account_id"] = doc.id
        accounts.append(Account(**account_data))
    
    return accounts

@app.post("/api/accounts", response_model=Account)
async def create_account(current_user: User = Depends(get_current_user)):
    # Create a new mock account
    account = generate_mock_account()
    account["uid"] = current_user.uid
    
    # Save to Firebase
    doc_ref = db.collection("accounts").document()
    doc_ref.set(account)
    
    account["account_id"] = doc_ref.id
    return Account(**account)

@app.get("/api/accounts/{account_id}/transactions", response_model=List[Transaction])
async def get_transactions(
    account_id: str, 
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # Verify account belongs to user
    account_ref = db.collection("accounts").document(account_id)
    account = account_ref.get()
    
    if not account.exists or account.to_dict().get("uid") != current_user.uid:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get transactions
    transactions_ref = db.collection("transactions").where("account_id", "==", account_id)
    
    if start_date and end_date:
        transactions_ref = transactions_ref.where("date", ">=", start_date).where("date", "<=", end_date)
    
    transactions = []
    for doc in transactions_ref.stream():
        transaction_data = doc.to_dict()
        transaction_data["transaction_id"] = doc.id
        transactions.append(Transaction(**transaction_data))
    
    # If no transactions exist yet, generate some mock data
    if not transactions:
        num_transactions = random.randint(5, 20)
        for _ in range(num_transactions):
            transaction = generate_mock_transaction(account_id)
            transaction["uid"] = current_user.uid
            # Save to Firebase
            doc_ref = db.collection("transactions").document()
            doc_ref.set(transaction)
            transaction["transaction_id"] = doc_ref.id
            transactions.append(Transaction(**transaction))
    
    # Sort by date
    transactions.sort(key=lambda x: x.date, reverse=True)
    return transactions

@app.post("/api/accounts/{account_id}/transactions", response_model=Transaction)
async def create_transaction(
    account_id: str,
    transaction_data: CreateTransactionRequest,
    current_user: User = Depends(get_current_user)
):
    # Verify account belongs to user
    account_ref = db.collection("accounts").document(account_id)
    account = account_ref.get()
    
    if not account.exists or account.to_dict().get("uid") != current_user.uid:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Create transaction
    transaction = {
        "uid": current_user.uid,
        "account_id": account_id,
        "amount": transaction_data.amount,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "name": transaction_data.name,
        "category": transaction_data.category or ["uncategorized"],
        "pending": False
    }
    
    # Save to Firebase
    doc_ref = db.collection("transactions").document()
    doc_ref.set(transaction)
    
    # Update account balance
    account_data = account.to_dict()
    account_data["balance"] += transaction_data.amount
    account_ref.update({"balance": account_data["balance"]})
    
    transaction["transaction_id"] = doc_ref.id
    return Transaction(**transaction)

@app.get("/api/savings/goals", response_model=List[SavingsGoal])
async def get_savings_goals(current_user: User = Depends(get_current_user)):
    goals_ref = db.collection("savings_goals").where("uid", "==", current_user.uid)
    goals = []
    
    for doc in goals_ref.stream():
        goal_data = doc.to_dict()
        goal_data["goal_id"] = doc.id
        goals.append(SavingsGoal(**goal_data))
    
    return goals

@app.post("/api/savings/goals", response_model=SavingsGoal)
async def create_savings_goal(
    goal_data: CreateSavingsGoalRequest,
    current_user: User = Depends(get_current_user)
):
    goal = {
        "uid": current_user.uid,
        "name": goal_data.name,
        "target_amount": goal_data.target_amount,
        "current_amount": 0.0,
        "target_date": goal_data.target_date
    }
    
    # Save to Firebase
    doc_ref = db.collection("savings_goals").document()
    doc_ref.set(goal)
    
    goal["goal_id"] = doc_ref.id
    return SavingsGoal(**goal)

@app.put("/api/savings/goals/{goal_id}", response_model=SavingsGoal)
async def update_savings_goal(
    goal_id: str,
    amount: float,
    current_user: User = Depends(get_current_user)
):
    goal_ref = db.collection("savings_goals").document(goal_id)
    goal = goal_ref.get()
    
    if not goal.exists or goal.to_dict().get("uid") != current_user.uid:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    goal_data = goal.to_dict()
    goal_data["current_amount"] += amount
    goal_ref.update({"current_amount": goal_data["current_amount"]})
    
    goal_data["goal_id"] = goal_id
    return SavingsGoal(**goal_data)

@app.get("/api/analytics/spending", response_model=Dict[str, Any])
async def get_spending_analytics(
    period: str = "month",
    current_user: User = Depends(get_current_user)
):
    # Calculate date range based on period
    today = datetime.now()
    if period == "week":
        start_date = (today - timedelta(days=7)).strftime("%Y-%m-%d")
    elif period == "month":
        start_date = (today - timedelta(days=30)).strftime("%Y-%m-%d")
    elif period == "year":
        start_date = (today - timedelta(days=365)).strftime("%Y-%m-%d")
    else:
        raise HTTPException(status_code=400, detail="Invalid period. Use 'week', 'month', or 'year'")
    
    end_date = today.strftime("%Y-%m-%d")
    
    # Get user accounts
    accounts_ref = db.collection("accounts").where("uid", "==", current_user.uid)
    account_ids = [doc.id for doc in accounts_ref.stream()]
    
    # Initialize analytics results
    result = {
        "total_spending": 0,
        "spending_by_category": {},
        "average_daily_spending": 0,
        "transactions_count": 0,
        "largest_transaction": None,
        "spending_trend": []
    }
    
    transactions = []
    for account_id in account_ids:
        transactions_ref = db.collection("transactions").where("account_id", "==", account_id).where("date", ">=", start_date).where("date", "<=", end_date)
        for doc in transactions_ref.stream():
            transaction = doc.to_dict()
            transaction["transaction_id"] = doc.id
            transactions.append(transaction)
    
    if not transactions:
        return result
    
    # Calculate analytics
    for transaction in transactions:
        # Only count negative amounts (spending)
        amount = transaction["amount"]
        if amount < 0:
            amount = abs(amount)
            result["total_spending"] += amount
            
            # Spending by category
            categories = transaction.get("category", ["uncategorized"])
            main_category = categories[0] if categories else "uncategorized"
            if main_category not in result["spending_by_category"]:
                result["spending_by_category"][main_category] = 0
            result["spending_by_category"][main_category] += amount
            
            # Track largest transaction
            if not result["largest_transaction"] or amount > result["largest_transaction"]["amount"]:
                result["largest_transaction"] = {
                    "amount": amount,
                    "name": transaction["name"],
                    "date": transaction["date"]
                }
    
    # Calculate trends (group by day or week depending on period)
    date_format = "%Y-%m-%d"
    
    # Create a dictionary to store spending by date
    spending_by_date = {}
    for transaction in transactions:
        if transaction["amount"] < 0:
            date_str = transaction["date"]
            if date_str not in spending_by_date:
                spending_by_date[date_str] = 0
            spending_by_date[date_str] += abs(transaction["amount"])
    
    # Convert to list of objects sorted by date
    for date_str, amount in sorted(spending_by_date.items()):
        result["spending_trend"].append({
            "date": date_str,
            "amount": amount
        })
    
    # Calculate total transactions and average daily spending
    result["transactions_count"] = len(transactions)
    days_in_period = (today - datetime.strptime(start_date, date_format)).days + 1
    result["average_daily_spending"] = result["total_spending"] / max(days_in_period, 1)
    
    return result

@app.get("/api/analytics/savings", response_model=Dict[str, Any])
async def get_savings_analytics(current_user: User = Depends(get_current_user)):
    # Get user accounts
    accounts_ref = db.collection("accounts").where("uid", "==", current_user.uid).where("type", "==", "depository")
    
    total_balance = 0
    accounts_data = []
    
    for doc in accounts_ref.stream():
        account = doc.to_dict()
        account["account_id"] = doc.id
        
        if account["subtype"] == "savings":
            total_balance += account["balance"]
            accounts_data.append({
                "name": account["name"],
                "balance": account["balance"]
            })
        
    # Get savings goals
    goals_ref = db.collection("savings_goals").where("uid", "==", current_user.uid)
    goals_data = []
    
    total_goal_progress = 0
    total_goal_target = 0
    
    for doc in goals_ref.stream():
        goal = doc.to_dict()
        goal["goal_id"] = doc.id
        
        progress_percent = (goal["current_amount"] / goal["target_amount"]) * 100 if goal["target_amount"] > 0 else 0
        
        goals_data.append({
            "name": goal["name"],
            "current_amount": goal["current_amount"],
            "target_amount": goal["target_amount"],
            "target_date": goal["target_date"],
            "progress_percent": progress_percent
        })
        
        total_goal_progress += goal["current_amount"]
        total_goal_target += goal["target_amount"]

    total_progress_percent = (total_goal_progress / total_goal_target) * 100 if total_goal_target > 0 else 0
    
    return {
        "total_savings_balance": total_balance,
        "savings_accounts": accounts_data,
        "savings_goals": goals_data,
        "total_goal_progress": total_goal_progress,
        "total_goal_target": total_goal_target,
        "overall_progress_percent": total_progress_percent
    }

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 