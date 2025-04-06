"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, getFirestore, updateDoc, onSnapshot } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import {
  BarChart,
  Bell,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  LogOut,
  Menu,
  Moon,
  PieChart,
  Settings,
  Sun,
  Target,
  Wallet,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PortfolioChart } from "./portfolio-chart"
import { ReturnsChart } from "./returns-chart"
import Link from "next/link"
// import { SpendingChart } from "./spending-chart"
// import { TransactionsList } from "./transactions-list"

// User data interface based on Firestore structure
interface UserData {
  name: string
  email: string
  photoURL: string | null
  accountStatus: string
  emailVerified: boolean
  lastLogin: string
  createdAt: string
  authProvider: string
  financialInfo: {
    accountConnected: boolean
    portfolioValue: number
    totalInvested: number
    totalReturns: number
    lastDepositDate: string
    firstDepositDate: string
  }
  investmentProfile: {
    investmentGoals: string[]
    preferredSectors: string[]
    riskTolerance: string | null
  }
  settings: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    theme: "light" | "dark"
    twoFactorEnabled: boolean
  }
  userId: string
}

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("overview")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const db = getFirestore()

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthInitialized(true)

      // If we have cached data, use it immediately while fetching fresh data
      const cachedData = localStorage.getItem("userData")
      if (cachedData && !userData) {
        try {
          const parsedData = JSON.parse(cachedData)
          setUserData(parsedData)

          // Apply cached theme preference immediately
          if (parsedData.settings?.theme) {
            setTheme(parsedData.settings.theme)
          }
        } catch (e) {
          console.error("Error parsing cached user data", e)
        }
      }
    })

    return () => unsubscribe()
  }, [setTheme, userData])

  // Redirect if not authenticated after auth is initialized
  useEffect(() => {
    if (authInitialized && !currentUser) {
      router.push("/login")
    }
  }, [authInitialized, currentUser, router])

  // Fetch user data from Firestore when user is authenticated
  useEffect(() => {
    // Store unsubscribe function to cleanup on unmount
    let unsubscribeUser: (() => void) | null = null;
    
    const subscribeToUserData = () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userRef = doc(db, "users", currentUser.uid);
        
        // Set up real-time listener instead of one-time fetch
        unsubscribeUser = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as UserData;
            setUserData(data);
            
            // Cache the user data
            localStorage.setItem("userData", JSON.stringify(data));
            
            // Set theme based on user preference
            if (data.settings?.theme) {
              setTheme(data.settings.theme);
            }
          } else {
            console.error("No user data found");
            // Don't redirect here, let the auth effect handle it
          }
          
          // Once we have data, we're no longer loading
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user data:", error);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error setting up user data listener:", error);
        setLoading(false);
      }
    };
    
    if (currentUser) {
      subscribeToUserData();
    }
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [currentUser, setTheme, db]);

  // Handle theme toggle and save to user preferences
  const handleThemeToggle = async () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    try {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid)
        await updateDoc(userRef, {
          "settings.theme": newTheme,
        })

        // Update cached data
        if (userData) {
          const updatedData = {
            ...userData,
            settings: { ...userData.settings, theme: newTheme },
          }
          localStorage.setItem("userData", JSON.stringify(updatedData))
        }
      }
    } catch (error) {
      console.error("Error updating theme preference:", error)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Clear cached data
      localStorage.removeItem("userData")
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Show loading state while auth is initializing or data is loading
  if (!authInitialized || (currentUser && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop only) */}
        <aside className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <a href="#" className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-accent-foreground">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              <CreditCard className="h-4 w-4" />
              <span>Account Summary</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              <Target className="h-4 w-4" />
              <span>Investment Goals</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              <PieChart className="h-4 w-4" />
              <span>Preferred Sectors</span>
            </a>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            <div className="flex gap-4">
              <Button variant="default" onClick={() => router.push(`/deposit/${currentUser?.uid}`)}>Deposit</Button>
              <Button variant="outline">Withdraw</Button>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{userData?.financialInfo?.portfolioValue?.toLocaleString() || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userData?.financialInfo?.firstDepositDate  }
                      <span className="text-green-500">+20.1%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{userData?.financialInfo?.totalInvested?.toLocaleString() || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">+4.3%</span> from initial investment
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{userData?.financialInfo?.totalReturns?.toLocaleString() || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">+10.1%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{userData?.accountStatus || "Inactive"}</div>
                    <p className="text-xs text-muted-foreground">
                      {userData?.financialInfo?.accountConnected ? "Account connected" : "Connect your account"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Portfolio Value</CardTitle>
                    <CardDescription>Your portfolio growth over time</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <PortfolioChart />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Investment Returns</CardTitle>
                    <CardDescription>Monthly returns on your investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReturnsChart />
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Latest Transactions</CardTitle>
                    <CardDescription>Your recent financial activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* <TransactionsList userId={userData?.userId} /> */}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Spending Patterns</CardTitle>
                    <CardDescription>Where your money goes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* <SpendingChart /> */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Analytics</CardTitle>
                  <CardDescription>Detailed analysis of your financial data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-10">
                    Advanced analytics content will appear here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}