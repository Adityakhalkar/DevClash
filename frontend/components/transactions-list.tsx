// Add this component to fetch transactions from multiple collections
// You can place it in a new file like components/transactions-list.tsx

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, Firestore } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "emergency";
  status: string;
  amount: number;
  createdAt: string;
  paymentMethod?: string;
  emergency?: boolean;
  emergencyType?: string;
}

interface TransactionsListProps {
  userId: string | undefined;
  db: Firestore;
  limitCount?: number;
}

export function TransactionsList({ userId, db, limitCount = 10 }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch from deposits collection
        const depositsQuery = query(
          collection(db, "deposits"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(limitCount)
        );
        
        // Fetch from withdrawals collection
        const withdrawalsQuery = query(
          collection(db, "withdrawals"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(limitCount)
        );
        
        // Fetch from emergencyWithdrawals collection
        const emergencyQuery = query(
          collection(db, "emergencyWithdrawals"),
          where("userId", "==", userId),
          orderBy("submittedAt", "desc"),
          limit(limitCount)
        );

        // Execute all queries in parallel
        const [depositsSnapshot, withdrawalsSnapshot, emergencySnapshot] = await Promise.all([
          getDocs(depositsQuery),
          getDocs(withdrawalsQuery),
          getDocs(emergencyQuery)
        ]);

        // Process deposits
        const deposits = depositsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: "deposit" as const,
          status: doc.data().status,
          amount: doc.data().amount,
          createdAt: doc.data().createdAt,
          paymentMethod: doc.data().paymentMethod
        }));

        // Process regular withdrawals
        const withdrawals = withdrawalsSnapshot.docs
          .filter(doc => !doc.data().emergency) // Filter out emergency withdrawals
          .map(doc => ({
            id: doc.id,
            type: "withdrawal" as const,
            status: doc.data().status,
            amount: doc.data().amount,
            createdAt: doc.data().createdAt,
            paymentMethod: doc.data().paymentMethod
          }));

        // Process emergency withdrawals
        const emergencyWithdrawals = emergencySnapshot.docs.map(doc => ({
          id: doc.id,
          type: "emergency" as const,
          status: doc.data().status,
          amount: doc.data().amount,
          createdAt: doc.data().submittedAt,
          paymentMethod: doc.data().paymentMethod,
          emergency: true,
          emergencyType: doc.data().emergencyType
        }));

        // Combine and sort all transactions by date
        const allTransactions = [...deposits, ...withdrawals, ...emergencyWithdrawals]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limitCount);

        setTransactions(allTransactions);

      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, db, limitCount]);

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button className="mt-4 text-primary text-sm hover:underline">Retry</button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No transactions found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Make your first deposit to get started with investing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div className="flex items-center gap-3">
            {transaction.type === "deposit" ? (
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            ) : transaction.type === "emergency" ? (
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            
            <div>
              <p className="font-medium">
                {transaction.type === "deposit" 
                  ? "Deposit" 
                  : transaction.type === "emergency"
                    ? "Emergency Withdrawal" 
                    : "Withdrawal"}
                
                {transaction.type === "emergency" && transaction.emergencyType && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({transaction.emergencyType.replace('_', ' ')})
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.createdAt).toLocaleDateString()} • 
                {transaction.paymentMethod && (
                  <span className="ml-1 capitalize">{transaction.paymentMethod}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {transaction.type === "deposit" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
            </p>
            <div className="mt-1">
              {transaction.status === "completed" ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Complete
                </Badge>
              ) : transaction.status === "pending_review" || transaction.status === "pending" ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  <Clock className="mr-1 h-3 w-3" /> Pending
                </Badge>
              ) : transaction.status === "failed" ? (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  <XCircle className="mr-1 h-3 w-3" /> Failed
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                  <Clock className="mr-1 h-3 w-3" /> Processing
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}