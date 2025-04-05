"use client"

import { useTheme } from "next-themes"
import { useEffect, useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export function ReturnsChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [user, setUser] = useState<any>(null)
  const [returnsData, setReturnsData] = useState<{ month: string; return: number }[]>([])

  const months = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], []);

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchReturns = async () => {
      if (!user) return

      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const financialInfo = userSnap.data().financialInfo
        const totalReturns = financialInfo?.totalReturns || 0

        // Distribute returns equally across the last 6 months
        const avgReturn = totalReturns / 6

        const generatedData = months.map((month) => ({
          month,
          return: parseFloat(avgReturn.toFixed(2)),
        }))

        setReturnsData(generatedData)
      }
    }

    fetchReturns()
  }, [user, months])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={returnsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const value = payload[0].value as number
              const isPositive = value >= 0

              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.month}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Return</span>
                      <span className={`font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="return" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
