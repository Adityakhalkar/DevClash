from datetime import datetime
import uuid
import firebase_admin
from firebase_admin import firestore
from ..schemas.models import TransactionOut, TransactionCreate

db = firestore.client()

class TransactionService:
    @staticmethod
    def create_transaction(transaction: TransactionCreate) -> TransactionOut:
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            "transaction_id": transaction_id,
            "user_id": transaction.user_id,
            "amount": transaction.amount,
            "created_at": datetime.now().isoformat(),
            "description": transaction.description,
            "payment_intent_id": transaction.payment_intent_id,
            "type": transaction.type
        }
        
        db.collection("transactions").document(transaction_id).set(transaction_data)
        return TransactionOut(**transaction_data)

    @staticmethod
    def get_user_transactions(user_id: str) -> list[TransactionOut]:
        transactions_ref = db.collection("transactions").where("user_id", "==", user_id).stream()
        return [TransactionOut(**tx.to_dict()) for tx in transactions_ref]