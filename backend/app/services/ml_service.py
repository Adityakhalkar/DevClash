from ..model.ml_models import MODELS

class MLService:
    @staticmethod
    def check_withdrawal(features: dict) -> bool:
        """Direct output from pre-trained withdrawal model"""
        model = MODELS["withdrawal"]
        # Ensure features are in consistent order
        ordered_features = [
            features["net_monthly_income"],
            features["monthly_expenses"],
            features["net_monthly_income"/"avg_monthly_spend"],
            features["transaction_amount"],
            features["days_since_last_salary"],
            features["avg_monthly_spend"],
            features["current_balance"],
            features["amount"],
            features["days_since_last_withdrawal"],
        ]
        return model.predict([ordered_features])[0]

    @staticmethod
    def get_savings_decisions(features: dict) -> dict:
        """Get decisions from all 3 savings models"""
        ordered_features = [
            features["net_monthly_income"],
            features["monthly_expenses"],
            features["current_balance"],
            features["amount"],
            features["days_since_last_withdrawal"],
            features["transaction_amount"],
            features["days_since_last_salary"],
            features["avg_monthly_spend"],
            features["net_monthly_income"/"avg_monthly_spend"],
        ]
        return {
            "model_1": bool(MODELS["savings_1"].predict([ordered_features])[0]),
            "model_2": bool(MODELS["savings_2"].predict([ordered_features])[0]),
            "model_3": bool(MODELS["savings_3"].predict([ordered_features])[0])
        }