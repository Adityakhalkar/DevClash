import pandas as pd

# 🚀 Load dataset
df = pd.read_csv("./reduced_5000_each_user_type.csv")

# 🧠 Percent-Based Save Logic
def get_percent_save_amount(row):
    amount = row["transaction_amount"]

    if amount <= 1500:
        return round(amount * 0.07)  # Save ~3%
    elif amount <= 7000:
        return round(amount * 0.15)  # Save ~5%
    else:
        return round(amount * 0.25)  # Save ~8% for large purchases

# 💸 Apply only where save_decision = 1
df["auto_save_amount"] = df.apply(
    lambda row: get_percent_save_amount(row) if row["save_decision"] == 1 else 0,
    axis=1
)

# 💾 Save the updated dataset
df.to_csv("save_amount_percent_based.csv", index=False)
print("✅ Saved: save_amount_percent_based.csv with auto_save_amount column using percent logic.")
