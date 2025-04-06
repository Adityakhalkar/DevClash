from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from datetime import datetime, timedelta
from typing import List, Optional

app = FastAPI(title="Plaid Sandbox API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Plaid API Configuration
PLAID_URL = "https://sandbox.plaid.com"
CLIENT_ID = "67f0d05eb76f9a002352f16d"  # Replace with your client ID
SANDBOX_SECRET = "e6e7c31f4142fe95b1eb41bd1b997d"  # Replace with your sandbox secret

# Pydantic models for request/response validation
class PlaidLinkTokenRequest(BaseModel):
    client_user_id: str
    client_name: str
    products: List[str] = ["transactions"]
    country_codes: List[str] = ["US"]
    language: str = "en"

class PublicTokenRequest(BaseModel):
    public_token: str

class AccessTokenRequest(BaseModel):
    access_token: str

class TransactionRequest(BaseModel):
    access_token: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SandboxSimulateRequest(BaseModel):
    access_token: str
    webhook_code: str = "DEFAULT_UPDATE"

class TransactionOverride(BaseModel):
    transaction_id: str
    amount: float
    date: str
    name: str
    
class TransactionOverridesRequest(BaseModel):
    access_token: str
    overrides: List[TransactionOverride]

# Helper function for making API requests
async def plaid_request(endpoint: str, data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PLAID_URL}{endpoint}",
            json={
                "client_id": CLIENT_ID,
                "secret": SANDBOX_SECRET,
                **data
            },
            headers={"Content-Type": "application/json"}
        )
        
        result = response.json()
        if "error_code" in result:
            raise HTTPException(status_code=400, detail=result)
        return result

@app.post("/api/create_link_token")
async def create_link_token(request: PlaidLinkTokenRequest):
    """Create a Link token to initialize Plaid Link"""
    data = {
        "user": {"client_user_id": request.client_user_id},
        "client_name": request.client_name,
        "products": request.products,
        "country_codes": request.country_codes,
        "language": request.language
    }
    
    result = await plaid_request("/link/token/create", data)
    return result

@app.post("/api/exchange_public_token")
async def exchange_public_token(request: PublicTokenRequest):
    """Exchange a public token for an access token"""
    data = {
        "public_token": request.public_token
    }
    
    result = await plaid_request("/item/public_token/exchange", data)
    return result

@app.post("/api/get_transactions")
async def get_transactions(request: TransactionRequest):
    """Get transactions for a specific access token"""
    end_date = request.end_date or datetime.now().strftime("%Y-%m-%d")
    
    if not request.start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    else:
        start_date = request.start_date
    
    data = {
        "access_token": request.access_token,
        "start_date": start_date,
        "end_date": end_date
    }
    
    result = await plaid_request("/transactions/get", data)
    return result

@app.post("/api/sandbox/create_public_token")
async def create_sandbox_public_token():
    """Create a sandbox public token for testing"""
    data = {
        "institution_id": "ins_109508",  # Chase Bank
        "initial_products": ["transactions"]
    }
    
    result = await plaid_request("/sandbox/public_token/create", data)
    return result

@app.post("/api/sandbox/simulate_transactions")
async def simulate_transactions(request: SandboxSimulateRequest):
    """Simulate transaction webhooks in the sandbox environment"""
    data = {
        "access_token": request.access_token,
        "webhook_code": request.webhook_code
    }
    
    result = await plaid_request("/sandbox/item/fire_webhook", data)
    return result

@app.post("/api/sandbox/set_transaction_overrides")
async def set_transaction_overrides(request: TransactionOverridesRequest):
    """Create custom transactions in the sandbox environment"""
    data = {
        "access_token": request.access_token,
        "overrides": [override.dict() for override in request.overrides]
    }
    
    result = await plaid_request("/sandbox/item/set_transaction_overrides", data)
    return result

@app.post("/api/sandbox/simulate_transfer")
async def simulate_transfer(request: AccessTokenRequest):
    """Simulate a bank transfer in the sandbox environment"""
    # Note: This is a simplified example. In a real application, you would
    # first need to create a transfer before simulating its status change
    data = {
        "access_token": request.access_token,
        "event_type": "posted"  # Other options: failed, returned, settled
    }
    
    # This is a placeholder as the actual API endpoint requires more setup
    # In a real application, you would first create a transfer
    return {"message": "Transfer simulation endpoint. Requires additional setup."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)