from fastapi import FastAPI
from backend.fund_utils import router as fund_router  # Adjusted to relative import

app = FastAPI()
app.include_router(fund_router)
