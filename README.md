# 💰 Savium — Your One-Stop Gateway to Savings and Stable Investments

**Savium** is a smart savings and liquid investment assistant that helps users automate their savings and make informed decisions about stable mutual fund investments. We focus on improving financial wellness through intelligent automation and data-driven investment recommendations.

---

## 🚀 Problem Statement

- Many users struggle with consistent saving due to poor planning or lack of awareness.
- Investing in stable instruments (e.g., liquid mutual funds) often requires expert guidance.
- Manual financial tracking and saving reduce convenience and consistency.

---
## 💡 Our Solution

### 1. Automated Savings  
Savium leverages ML models like **XGBoost** and **Random Forest** to analyze user income and spending patterns. It automates monthly savings (10–15%) by predicting optimal saving moments without impacting lifestyle.

### 2. Stable Returns with Liquid Funds  
We provide curated, low-risk, and high-liquidity liquid mutual fund recommendations using simulated datasets. This ensures consistent and safe returns on idle funds.

### 3. API-Driven Ecosystem  
Savium simulates a secure banking environment with mock and real API integrations (e.g., Stripe) for account management, transaction history, and goal-based savings.

---

## 🧠 Features

- 📊 **Savings Optimizer** — Personalized ML-based savings recommendations  
- 🔐 **Secure Mock Authentication** — Simulate login flows using OAuth2 and bearer tokens  
- 💼 **Mutual Fund Insights** — Safe, data-backed recommendations for liquid mutual funds  
- 🏦 **Goal-Based Saving Simulation** — Create and manage financial goals  
- 🧾 **Transaction History** — Simulated bank-like transactions and history  
- 🎯 **Developer-Friendly APIs** — RESTful API endpoints for seamless integration  

---

## ⚙️ Tech Stack

### Frontend
- `Next.js` (v15.2.4)
- `TypeScript`(^5)
- `Tailwind CSS`(^4.1.3)
- `Framer Motion`(^12.6.3)
- `Lucide React`(^0.487.0)
- `React` (v19)

### Backend
- `FastAPI`
- `Uvicorn`
- `Pydantic`
- `Firebase Admin`(^13.2.0)
- `Stripe` (test environment)

### AI/ML Layer
- `Python`
- `Scikit-learn`, `TensorFlow`
- `Pandas`, `NumPy`

### Authentication
- `OAuth2`, `Bearer Token` (mocked for demo)

### Database & Hosting
- `Firebase Firestore`
- `Firebase Authentication`
- Deployment via `Render` & `Vercel`
- Version control: `GitHub`

---

## 📦 Dependencies

```json
{
  "firebase": "^11.6.0",
  "firebase-admin": "^13.2.0",
  "framer-motion": "^12.6.3",
  "lucide-react": "^0.487.0",
  "next": "15.2.4",
  "next-themes": "^0.4.6",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-hot-toast": "^2.5.2"
}
```

---

## 🧪 Run Locally

### Backend (FastAPI)

```bash
pip install -r requirements.txt
uvicorn index:app --reload
```

### in new terminal:
```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```
### Frontend (Next.js)

```bash
npm run dev
```

> Make sure to add `http://localhost:3000` as the local repo for the frontend.

---

## 🧭 Future Enhancements

- Real-time integration with Plaid for live bank data  
- NLP-based smart query assistant  
- Push notifications for savings reminders  
- User dashboard for goal and performance tracking  

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License. See `LICENSE` for more information.