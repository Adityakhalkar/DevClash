"use client"

import { useTheme } from "next-themes"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

interface PortfolioDataPoint {
  month: string
  value: number
  timestamp: Date
  contributionValue: number // Track user contributions separately
  growthValue: number // Track investment growth separately
}

interface Transaction {
  amount: number
  createdAt: string | Timestamp
  type: "deposit" | "withdrawal" | "emergency"
  status: string
}

interface PortfolioChartProps {
  userId?: string // Optional userId prop to allow displaying other users' portfolios
  months?: number // Number of months to display, defaults to 12
  currency?: string // Currency symbol, defaults to ₹
}

export function PortfolioChart({ userId, months = 12, currency = "₹" }: PortfolioChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [chartData, setChartData] = useState<PortfolioDataPoint[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [startValue, setStartValue] = useState<number>(0) // Initial portfolio value
  const [currentValue, setCurrentValue] = useState<number>(0) // Current portfolio value
  const [totalContributions, setTotalContributions] = useState<number>(0) // Total contributions
  const [totalGrowth, setTotalGrowth] = useState<number>(0) // Total growth
  
  useEffect(() => {
    const fetchTransactionsAndBuildPortfolio = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Determine which user's data to fetch
        const currentUser = auth.currentUser
        const targetUserId = userId || currentUser?.uid
        
        if (!targetUserId) {
          throw new Error("No user ID available")
        }
        
        // Fetch current portfolio value
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", targetUserId)
        )
        
        const userSnapshot = await getDocs(userQuery)
        let latestPortfolioValue = 0
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data()
          latestPortfolioValue = userData.financialInfo?.portfolioValue || 0
          setCurrentValue(latestPortfolioValue)
        }
        
        // Set date range - start from X months ago
        const endDate = new Date()
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - months)
        
        // Fetch all transactions within this date range
        const transactions: Transaction[] = []
        
        // Fetch deposits
        const depositsQuery = query(
          collection(db, "deposits"),
          where("userId", "==", targetUserId),
          where("createdAt", ">=", startDate.toISOString()),
          orderBy("createdAt", "asc")
        )
        
        const depositsSnapshot = await getDocs(depositsQuery)
        depositsSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.status === "completed" || data.status === "processing") {
            transactions.push({
              amount: data.amount,
              createdAt: data.createdAt,
              type: "deposit",
              status: data.status
            })
          }
        })
        
        // Fetch withdrawals
        const withdrawalsQuery = query(
          collection(db, "withdrawals"),
          where("userId", "==", targetUserId),
          where("createdAt", ">=", startDate.toISOString()),
          orderBy("createdAt", "asc")
        )
        
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
        withdrawalsSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.status === "completed" || data.status === "processing") {
            transactions.push({
              amount: data.amount,
              createdAt: data.createdAt,
              type: "withdrawal",
              status: data.status
            })
          }
        })
        
        // Fetch emergency withdrawals
        const emergencyQuery = query(
          collection(db, "emergencyWithdrawals"),
          where("userId", "==", targetUserId),
          where("submittedAt", ">=", startDate.toISOString()),
          orderBy("submittedAt", "asc")
        )
        
        const emergencySnapshot = await getDocs(emergencyQuery)
        emergencySnapshot.forEach(doc => {
          const data = doc.data()
          if (data.status === "completed" || data.status === "processing") {
            transactions.push({
              amount: data.amount,
              createdAt: data.submittedAt, // Note different field name
              type: "emergency",
              status: data.status
            })
          }
        })
        
        // Sort all transactions by date
        transactions.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
          return dateA - dateB
        })
        
        // Calculate monthly portfolio values
        const calculatedData = await calculatePortfolioTimeline(transactions, latestPortfolioValue, startDate, endDate)
        
        setChartData(calculatedData.chartData)
        setStartValue(calculatedData.startValue)
        setTotalContributions(calculatedData.totalContributions)
        setTotalGrowth(calculatedData.totalGrowth)
        
      } catch (err) {
        console.error("Failed to fetch portfolio data:", err)
        setError("Failed to load portfolio data")
        
        // Fallback to placeholder data
        generatePlaceholderData()
      } finally {
        setLoading(false)
      }
    }
    
    const calculatePortfolioTimeline = async (
      transactions: Transaction[], 
      currentPortfolioValue: number,
      startDate: Date,
      endDate: Date
    ): Promise<{
      chartData: PortfolioDataPoint[],
      startValue: number,
      totalContributions: number,
      totalGrowth: number
    }> => {
      // We'll work backwards from current portfolio value
      const monthlyData: { [key: string]: PortfolioDataPoint } = {}
      
      // Create an array of months between start and end date
      const months: Date[] = []
      let currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        months.push(new Date(currentDate))
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      // Initialize monthly data points with zeroes
      months.forEach(date => {
        const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
        const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' })
        
        monthlyData[monthKey] = {
          month: monthLabel,
          value: 0,
          contributionValue: 0,
          growthValue: 0,
          timestamp: new Date(date)
        }
      })
      
      // Calculate net contributions to determine investment growth
      let netContributions = 0
      
      transactions.forEach(transaction => {
        const transactionDate = transaction.createdAt instanceof Timestamp 
          ? transaction.createdAt.toDate() 
          : new Date(transaction.createdAt as string)
        const monthKey = transactionDate.toISOString().substring(0, 7)
        
        // Only count if this month is in our display range
        if (monthlyData[monthKey]) {
          if (transaction.type === "deposit") {
            netContributions += transaction.amount
          } else {
            netContributions -= transaction.amount
          }
        }
      })
      
      // Calculate investment growth (returns)
      const investmentGrowth = currentPortfolioValue - netContributions
      
      // Determine approximate starting value
      // This is a simplified calculation - for a real app, you'd want to use actual historical data
      // or precise calculation of returns over time
      let startingValue = Math.max(0, currentPortfolioValue - netContributions - investmentGrowth)
      
      // If we have no transactions, we need to estimate the starting value
      if (transactions.length === 0) {
        // Assuming annual return of about 12%
        const monthsElapsed = months.length
        const monthlyReturnRate = 0.12 / 12 // 12% annual return, converted to monthly
        
        // P = F / (1 + r)^n where P is present value, F is future value, r is rate, n is number of periods
        startingValue = currentPortfolioValue / Math.pow(1 + monthlyReturnRate, monthsElapsed)
      }
      
      // Now distribute the values across months
      let runningPortfolioValue = startingValue
      let runningContributions = 0
      
      // First, apply all transactions in chronological order
      const transactionsByMonth: { [key: string]: number } = {}
      
      transactions.forEach(transaction => {
        const transactionDate = transaction.createdAt instanceof Timestamp 
          ? transaction.createdAt.toDate() 
          : new Date(transaction.createdAt as string)
        const monthKey = transactionDate.toISOString().substring(0, 7)
        
        if (!transactionsByMonth[monthKey]) {
          transactionsByMonth[monthKey] = 0
        }
        
        if (transaction.type === "deposit") {
          transactionsByMonth[monthKey] += transaction.amount
          runningContributions += transaction.amount
        } else {
          transactionsByMonth[monthKey] -= transaction.amount
          runningContributions -= transaction.amount
        }
      })
      
      // Now calculate monthly portfolio values with growth distribution
      const monthKeys = Object.keys(monthlyData).sort()
      let previousMonthValue = startingValue
      
      monthKeys.forEach((monthKey, index) => {
        // Apply any transactions for this month
        const monthlyTransaction = transactionsByMonth[monthKey] || 0
        
        if (index === 0) {
          // First month - start with initial value plus any transactions
          runningPortfolioValue = startingValue + monthlyTransaction
        } else {
          // Calculate growth since last month (simplified, assuming steady growth rate)
          const growthRate = investmentGrowth / (monthKeys.length - 1)
          const monthlyGrowth = (previousMonthValue * 0.01) + (growthRate / monthKeys.length)
          
          // Apply growth and transactions
          runningPortfolioValue = previousMonthValue + monthlyGrowth + monthlyTransaction
        }
        
        // Store the calculated value
        monthlyData[monthKey].value = Math.round(runningPortfolioValue)
        monthlyData[monthKey].contributionValue = runningContributions
        monthlyData[monthKey].growthValue = monthlyData[monthKey].value - runningContributions
        
        // Set for next iteration
        previousMonthValue = runningPortfolioValue
      })
      
      // Convert the object to an array
      const chartData = Object.values(monthlyData)
      
      // Ensure the final value matches current portfolio value
      if (chartData.length > 0) {
        chartData[chartData.length - 1].value = currentPortfolioValue
        chartData[chartData.length - 1].growthValue = currentPortfolioValue - runningContributions
      }
      
      return {
        chartData,
        startValue: startingValue,
        totalContributions: runningContributions,
        totalGrowth: currentPortfolioValue - runningContributions
      }
    }
    
    const generatePlaceholderData = () => {
      // Generate placeholder data for demo purposes
      const placeholderData: PortfolioDataPoint[] = []
      const date = new Date()
      
      // Start from months ago
      date.setMonth(date.getMonth() - (months - 1))
      
      // Generate one data point per month
      let startValue = 20000
      let runningValue = startValue
      let runningContribution = 0
      
      for (let i = 0; i < months; i++) {
        const currentDate = new Date(date)
        const month = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' })
        
        // Simulate monthly deposit
        const monthlyDeposit = 5000
        runningContribution += monthlyDeposit
        
        // Simulate growth (around 1% per month, plus some randomness)
        const growthRate = 0.01 + (Math.random() * 0.005)
        const growth = runningValue * growthRate
        
        runningValue += growth + monthlyDeposit
        
        placeholderData.push({
          month,
          value: Math.round(runningValue),
          timestamp: currentDate,
          contributionValue: runningContribution,
          growthValue: Math.round(runningValue - runningContribution)
        })
        
        // Move to next month
        date.setMonth(date.getMonth() + 1)
      }
      
      setStartValue(startValue)
      setCurrentValue(placeholderData[placeholderData.length - 1].value)
      setTotalContributions(runningContribution)
      setTotalGrowth(Math.round(runningValue - runningContribution))
      setChartData(placeholderData)
    }
    
    fetchTransactionsAndBuildPortfolio()
  }, [userId, months])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Calculate overall growth percentage
  const overallGrowthPercentage = startValue > 0 
    ? ((currentValue - startValue) / startValue) * 100 
    : 0;
  
  // Calculate contribution vs growth percentages
  const contributionPercentage = currentValue > 0 
    ? (totalContributions / currentValue) * 100 
    : 0;
  
  const growthPercentage = currentValue > 0 
    ? (totalGrowth / currentValue) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-card rounded-lg p-3 border shadow-sm">
          <p className="text-xs text-muted-foreground">Current Value</p>
          <p className="text-xl font-semibold">
            {currency}{currentValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card rounded-lg p-3 border shadow-sm">
          <p className="text-xs text-muted-foreground">Total Growth</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-xl font-semibold">
              {currency}{totalGrowth.toLocaleString()}
            </p>
            <span className={totalGrowth >= 0 ? "text-xs text-green-500" : "text-xs text-red-500"}>
              {totalGrowth >= 0 ? "+" : ""}{growthPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-card rounded-lg p-3 border shadow-sm">
          <p className="text-xs text-muted-foreground">Your Contributions</p>
          <p className="text-xl font-semibold">
            {currency}{totalContributions.toLocaleString()}
          </p>
        </div>
        <div className="bg-card rounded-lg p-3 border shadow-sm">
          <p className="text-xs text-muted-foreground">Growth Rate</p>
          <p className={`text-xl font-semibold ${overallGrowthPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
            {overallGrowthPercentage >= 0 ? "+" : ""}{overallGrowthPercentage.toFixed(2)}%
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={chartData} 
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <XAxis
            dataKey="month"
            stroke={isDark ? "#888888" : "#888888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={isDark ? "#888888" : "#888888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${currency}${value.toLocaleString()}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                        <span className="font-bold text-muted-foreground">{data.month}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Value</span>
                        <span className="font-bold">{currency}{data.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Contributions</span>
                        <span className="font-medium">{currency}{data.contributionValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Growth</span>
                        <span className={`font-medium ${data.growthValue >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {currency}{data.growthValue.toLocaleString()}
                          {' '}
                          ({((data.growthValue / data.value) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    {chartData.length > 1 && data.month !== chartData[0].month && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Monthly Change</span>
                          <span className={calculateGrowth(data) >= 0 ? "text-green-500" : "text-red-500"}>
                            {calculateGrowth(data) >= 0 ? "+" : ""}
                            {calculateGrowth(data).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          {/* Area for contributions */}
          <Line
            type="monotone"
            dataKey="contributionValue"
            stroke="#8884d8"
            strokeWidth={0}
            fill="#8884d8"
            opacity={0.1}
            dot={false}
          />
          {/* Line for total value */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, style: { fill: "#10b981" } }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Contributions vs Growth breakdown */}
      <div className="pt-2 border-t border-border mt-4">
        <p className="text-sm text-muted-foreground mb-2">Portfolio Composition</p>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500" 
            style={{ 
              width: `${contributionPercentage}%`,
              transition: 'width 1s ease-in-out' 
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <div>
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            <span className="text-muted-foreground">Contributions ({contributionPercentage.toFixed(0)}%)</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            <span className="text-muted-foreground">Growth ({growthPercentage.toFixed(0)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Helper function to calculate growth percentage
  function calculateGrowth(currentPoint: PortfolioDataPoint): number {
    // Find previous month's data point
    const currentIndex = chartData.findIndex(point => point.month === currentPoint.month)
    if (currentIndex <= 0) return 0 // First month or not found
    
    const previousPoint = chartData[currentIndex - 1]
    const growth = ((currentPoint.value - previousPoint.value) / previousPoint.value) * 100
    return growth
  }
}