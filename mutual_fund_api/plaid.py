from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class FundRecommendationRequest(BaseModel):
    risk_tolerance: str
    investment_amount: float


class FundRecommendation(BaseModel):
    fund_name: str
    fund_type: str
    return_1yr: float
    expense_ratio: float
    minimum_investment: float


@router.post("/recommend-liquid-funds", response_model=List[FundRecommendation])
def recommend_liquid_funds(request: FundRecommendationRequest):
    mock_funds = [
        {
            "fund_name": "ICICI Prudential Liquid Fund",
            "fund_type": "Liquid",
            "return_1yr": 6.5,
            "expense_ratio": 0.2,
            "minimum_investment": 1000,
        },
        {
            "fund_name": "Axis Liquid Fund",
            "fund_type": "Liquid",
            "return_1yr": 6.3,
            "expense_ratio": 0.18,
            "minimum_investment": 500,
        },
        {
            "fund_name": "SBI Liquid Fund",
            "fund_type": "Liquid",
            "return_1yr": 6.6,
            "expense_ratio": 0.22,
            "minimum_investment": 1000,
        },
        {
            "fund_name": "Nippon India Liquid Fund",
            "fund_type": "Liquid",
            "return_1yr": 6.4,
            "expense_ratio": 0.25,
            "minimum_investment": 500,
        },
    ]

    filtered_funds = [
        fund for fund in mock_funds
        if fund["minimum_investment"] <= request.investment_amount
    ]

    return filtered_funds
