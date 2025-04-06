import joblib  # For .joblib files
import pickle  # For .pkl files
from pathlib import Path

MODELS = {
    "withdrawal": None,
    "savings_1": None,
    "savings_2": None,
    "savings_3": None
}

def load_ml_models():
    """Load ML models from the models directory"""
    models_dir = Path(__file__).parents[2] / "models"  # Goes up to project-root/models
    
    try:
        # Load XGBoost withdrawal model (.joblib)
        MODELS["withdrawal"] = joblib.load(models_dir / "xgb_withdrawal_model.joblib")
        
        # Load Random Forest savings models (.pkl)
        MODELS["savings_1"] = pickle.load(open(models_dir / "rf_model_salaried.pkl", "rb"))
        MODELS["savings_2"] = pickle.load(open(models_dir / "rf_model_self_employed.pkl", "rb"))
        MODELS["savings_3"] = pickle.load(open(models_dir / "rf_model_student.pkl", "rb"))
        
        print("✅ All models loaded successfully")
    except Exception as e:
        print(f"❌ Model loading failed: {str(e)}")
        raise