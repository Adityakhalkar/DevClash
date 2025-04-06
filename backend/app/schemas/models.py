from pydantic import BaseModel
from datetime import datetime

class WithdrawalPrediction(BaseModel):
    can_withdraw: bool  # Direct output from model (1/0 converted to boolean)

class SavingsPrediction(BaseModel):
    model_1_decision: bool
    model_2_decision: bool
    model_3_decision: bool

class Transaction(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    created_at: datetime
    description: str
    payment_intent_id: str