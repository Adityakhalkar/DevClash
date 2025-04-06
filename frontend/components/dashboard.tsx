"use client"

import { JSX, SetStateAction, useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, getFirestore, updateDoc, onSnapshot, setDoc } from "firebase/firestore"
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
  AlertCircle,
  Loader2,
  AlertTriangle,
  FileImage,
  FilePlus,
  FileText,
  Paperclip,
  Shield,
  ShieldAlert,
  Upload,
  X,
  CircleDollarSign,
  ArrowUp,
  Car,
  CircleDot,
  Film,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  ThumbsUp,
  TrendingUp,
  Trophy,
  UtensilsCrossed,
  Zap,
  Check,
  Info
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { PortfolioChart } from "./portfolio-chart"
import { ReturnsChart } from "./returns-chart"
import SplineWatermarkRemover from './SplineWatermarkRemover'
import { TransactionsList } from "./transactions-list"

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
    lastWithdrawalDate?: string
    lastWithdrawalAmount?: number
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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("bank")
  const [withdrawError, setWithdrawError] = useState("")
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false)
  const [withdrawalEligibility, setWithdrawalEligibility] = useState<{
    eligible: boolean;
    reason?: string;
    processingDays: number;
  }>({
    eligible: true,
    processingDays: 1
  });
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [isEmergencyWithdrawal, setIsEmergencyWithdrawal] = useState(false)
  const [emergencyType, setEmergencyType] = useState("")
  const [emergencyDescription, setEmergencyDescription] = useState("")
  const [emergencyFiles, setEmergencyFiles] = useState<FileList | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [emergencyDocs, setEmergencyDocs] = useState<Array<{ file: File, preview?: string }>>([])
  const [documentType, setDocumentType] = useState("");

  // Add these lines after your other state variables
const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
const [expenses, setExpenses] = useState<{[key: string]: number}>({});
const [totalExpenses, setTotalExpenses] = useState<number>(0);
const [monthlySavings, setMonthlySavings] = useState<number>(0);
const [savingsPercentage, setSavingsPercentage] = useState<number>(0);
const [projectionYears, setProjectionYears] = useState<number>(5);
const [customInsights, setCustomInsights] = useState<Array<{
  title: string;
  description: string;
  icon: JSX.Element;
  colorClass: string;
}>>([]);
// Add these state variables near your other state variables
const [riskProfile, setRiskProfile] = useState<number>(60); // Default to moderate risk
const [isSavingRiskProfile, setIsSavingRiskProfile] = useState<boolean>(false);
const [riskProfileUpdated, setRiskProfileUpdated] = useState<boolean>(false);
const [showSectorsModal, setShowSectorsModal] = useState<boolean>(false);
// Sector update variables
const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
const [isSavingSectors, setIsSavingSectors] = useState<boolean>(false);

// Initialize selected sectors from user data
useEffect(() => {
  if (userData?.investmentProfile?.preferredSectors) {
    setSelectedSectors([...userData.investmentProfile.preferredSectors]);
  }
}, [userData]);

const updateSectorPreferences = async () => {
  if (!currentUser) return;
  
  setIsSavingSectors(true);
  
  try {
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      "investmentProfile.preferredSectors": selectedSectors
    });
    
    // Update local state if needed
    if (userData) {
      setUserData({
        ...userData,
        investmentProfile: {
          ...userData.investmentProfile,
          preferredSectors: selectedSectors
        }
      });
    }
    
    setShowSectorsModal(false);
    // TODO: Show success toast
  } catch (error) {
    console.error("Error updating sector preferences:", error);
    // TODO: Show error toast
  } finally {
    setIsSavingSectors(false);
  }
};

// Sector list with descriptions
const allSectors = [
  { 
    id: 'tech', 
    name: 'Technology', 
    description: 'Software, hardware, internet services, and IT infrastructure.',
    historicalReturns: '+15.2% annually over 10 years'
  },
  { 
    id: 'healthcare', 
    name: 'Healthcare', 
    description: 'Pharmaceuticals, biotech, medical devices, and healthcare services.',
    historicalReturns: '+12.1% annually over 10 years'
  },
  { 
    id: 'financial', 
    name: 'Financial Services', 
    description: 'Banks, insurance, wealth management, and fintech companies.',
    historicalReturns: '+9.8% annually over 10 years'
  },
  { 
    id: 'consumer', 
    name: 'Consumer Goods', 
    description: 'Retail, food & beverage, household products, and apparel.',
    historicalReturns: '+8.5% annually over 10 years'
  },
  { 
    id: 'energy', 
    name: 'Renewable Energy', 
    description: 'Solar, wind, hydroelectric, and clean energy technologies.',
    historicalReturns: '+11.7% annually over 10 years'
  },
  { 
    id: 'real_estate', 
    name: 'Real Estate', 
    description: 'Commercial, residential properties, and REITs.',
    historicalReturns: '+7.9% annually over 10 years'
  },
  { 
    id: 'manufacturing', 
    name: 'Manufacturing', 
    description: 'Industrial equipment, automotive, aerospace, and defense.',
    historicalReturns: '+8.2% annually over 10 years'
  },
  { 
    id: 'telecom', 
    name: 'Telecommunications', 
    description: 'Mobile networks, internet providers, and communication infrastructure.',
    historicalReturns: '+6.5% annually over 10 years'
  },
  { 
    id: 'materials', 
    name: 'Materials', 
    description: 'Chemicals, mining, forestry products, and construction materials.',
    historicalReturns: '+7.1% annually over 10 years'
  },
  { 
    id: 'utilities', 
    name: 'Utilities', 
    description: 'Electric, water, and gas utility companies.',
    historicalReturns: '+6.3% annually over 10 years'
  }
];

// Load the user's risk profile when user data is loaded
useEffect(() => {
  if (userData?.investmentProfile?.riskTolerance) {
    // Convert the string risk tolerance to a numeric value
    const riskToleranceMap: { [key: string]: number } = {
      'very_conservative': 10,
      'conservative': 30,
      'moderate': 60,
      'aggressive': 80,
      'very_aggressive': 100
    };
    
    setRiskProfile(riskToleranceMap[userData.investmentProfile.riskTolerance] || 60);
  }
}, [userData]);

// Handle risk profile change
const handleRiskProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setRiskProfile(Number(e.target.value));
  setRiskProfileUpdated(false);
};

// Save risk profile to Firebase
const saveRiskProfile = async () => {
  if (!currentUser) return;
  
  setIsSavingRiskProfile(true);
  
  try {
    // Convert the numeric risk profile to a string value for storage
    let riskTolerance: string;
    
    if (riskProfile <= 20) riskTolerance = 'very_conservative';
    else if (riskProfile <= 40) riskTolerance = 'conservative';
    else if (riskProfile <= 70) riskTolerance = 'moderate';
    else if (riskProfile <= 90) riskTolerance = 'aggressive';
    else riskTolerance = 'very_aggressive';
    
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      "investmentProfile.riskTolerance": riskTolerance
    });
    
    setRiskProfileUpdated(true);
    
    // Update local state if needed
    if (userData) {
      setUserData({
        ...userData,
        investmentProfile: {
          ...userData.investmentProfile,
          riskTolerance
        }
      });
    }
  } catch (error) {
    console.error("Error updating risk profile:", error);
    // TODO: Show error toast
  } finally {
    setIsSavingRiskProfile(false);
    
    // Hide the "Saved" badge after 3 seconds
    setTimeout(() => {
      setRiskProfileUpdated(false);
    }, 3000);
  }
};

// Helper functions for risk profile
const getRiskProfileLabel = (risk: number): string => {
  if (risk <= 20) return 'Very Conservative';
  if (risk <= 40) return 'Conservative';
  if (risk <= 70) return 'Moderate';
  if (risk <= 90) return 'Aggressive';
  return 'Very Aggressive';
};

const getRiskProfileDescription = (risk: number): string => {
  if (risk <= 20) {
    return 'You prefer stability and are willing to accept lower returns to minimize risk. Focus on capital preservation.';
  }
  if (risk <= 40) {
    return 'You are cautious but willing to take some risk for better returns. Your portfolio emphasizes stability with some growth potential.';
  }
  if (risk <= 70) {
    return 'You balance risk and reward, accepting moderate fluctuations for better long-term growth potential.';
  }
  if (risk <= 90) {
    return 'You are comfortable with significant market fluctuations for potentially higher returns and long-term growth.';
  }
  return 'You seek maximum returns and are willing to accept significant volatility and potential losses in pursuit of growth.';
};

// Asset allocation based on risk profile
const getEquityAllocation = (risk: number): number => {
  return Math.round(20 + (risk * 0.7));
};

const getDebtAllocation = (risk: number): number => {
  return Math.round(70 - (risk * 0.5));
};

const getGoldAllocation = (risk: number): number => {
  return Math.round(10 - (risk * 0.05));
};

const getCashAllocation = (risk: number): number => {
  const equity = getEquityAllocation(risk);
  const debt = getDebtAllocation(risk);
  const gold = getGoldAllocation(risk);
  return 100 - equity - debt - gold;
};

// Expected returns based on risk profile
const getAverageReturns = (risk: number): number => {
  return parseFloat((5 + (risk * 0.10)).toFixed(1));
};

const getBestCaseReturns = (risk: number): number => {
  return parseFloat((getAverageReturns(risk) + (risk * 0.15)).toFixed(1));
};

const getWorstCaseReturns = (risk: number): number => {
  return parseFloat((getAverageReturns(risk) - (risk * 0.12)).toFixed(1));
};


// Define investment rates
const inflationRate = 5.6; // Average inflation rate
const saviumRate = 1.5 + inflationRate; // Savium's rate (7.5% + Inflation)
const mutualFundRate = 12.0; // Average mutual fund returns
const debtMutualFunds = 6.3; // Average gold returns
const bankFDRate = 6.0; // Average bank FD returns


// Define expense categories with icons and colors
const expenseCategories = [
  { id: "food", name: "Food & Groceries", icon: <ShoppingBag className="h-4 w-4 text-green-500" />, color: "#22c55e" },
  { id: "housing", name: "Housing & Rent", icon: <Home className="h-4 w-4 text-blue-500" />, color: "#3b82f6" },
  { id: "utilities", name: "Utilities", icon: <Zap className="h-4 w-4 text-amber-500" />, color: "#f59e0b" },
  { id: "transport", name: "Transportation", icon: <Car className="h-4 w-4 text-purple-500" />, color: "#8b5cf6" },
  { id: "healthcare", name: "Healthcare", icon: <Stethoscope className="h-4 w-4 text-red-500" />, color: "#ef4444" },
  { id: "leisure", name: "Entertainment", icon: <Film className="h-4 w-4 text-pink-500" />, color: "#ec4899" },
  { id: "shopping", name: "Personal Shopping", icon: <ShoppingCart className="h-4 w-4 text-indigo-500" />, color: "#6366f1" },
  { id: "other", name: "Other Expenses", icon: <CircleDot className="h-4 w-4 text-gray-500" />, color: "#6b7280" },
];

// Handle expense changes
const handleExpenseChange = (category: string, value: number) => {
  const newExpenses = { ...expenses, [category]: value };
  setExpenses(newExpenses);
};


const calculateSavings = () => {
  const total = Object.values(expenses).reduce((sum, value) => sum + (value || 0), 0);
  setTotalExpenses(total);
  const savings = monthlyIncome - total;
  setMonthlySavings(savings);
  
  // Calculate savings as percentage of income
  const percentage = monthlyIncome > 0 ? Math.round((savings / monthlyIncome) * 100) : 0;
  setSavingsPercentage(percentage);
  
  // Update the generateInsights section to properly handle the savingsPercentage
  if (savings > 0 && userData?.financialInfo) {
    const portfolioValue = userData.financialInfo.portfolioValue || 0;
    const totalInvested = userData.financialInfo.totalInvested || 0;
    
    // Calculate potential additional portfolio value if user invests monthly savings
    const potentialInvestment = calculateProjection(savings, saviumRate, 10);
    
    // Update insights with this real data
    setCustomInsights([
      {
        title: "Portfolio Growth Potential",
        description: `By investing your monthly savings of ₹${savings.toLocaleString()}, you could grow your portfolio by ₹${potentialInvestment.toLocaleString()} in 10 years.`,
        icon: <TrendingUp className="h-5 w-5 text-black" />,
        colorClass: "bg-primary/10 border border-primary/20 text-black"
      }
    ]);
  }
};

// Function to render pie chart
const renderPieChart = () => {
  if (totalExpenses === 0) return null;
  
  let cumulativePercentage = 0;
  return expenseCategories.map(category => {
    const expense = expenses[category.id] || 0;
    if (expense === 0) return null;
    
    const percentage = (expense / totalExpenses) * 100;
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees (360 / 100)
    cumulativePercentage += percentage;
    const endAngle = cumulativePercentage * 3.6;
    
    // Calculate path for pie slice
    const x1 = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
    const y1 = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
    const x2 = 50 + 40 * Math.cos(Math.PI * endAngle / 180);
    const y2 = 50 + 40 * Math.sin(Math.PI * endAngle / 180);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    return (
      <path 
        key={category.id} 
        d={pathData} 
        fill={category.color} 
        stroke="#ffffff" 
        strokeWidth="1"
      />
    );
  });
};

// Function to calculate growth paths
const calculateGrowthPath = (rate: number, type: "high" | "medium" | "low" | "lowest") => {
  // Different curve patterns based on type
  const points = [];
  
  const multiplier = type === "high" ? 1.1 :
                    type === "medium" ? 1 :
                    type === "low" ? 0.9 : 0.8;
                    
  for (let i = 0; i <= 100; i += 5) {
    const x = i;
    // Create slightly different curves for each investment type
    const y = 100 - ((Math.pow(1 + (rate/100/12), i/5*12) - 1) * multiplier * 80);
    points.push(`${x},${y}`);
  }
  
  return `M0,100 L${points.join(' L')}`;
};

// Function to calculate projection amounts
const calculateProjection = (monthlySaving: number, rate: number, years: number): number => {
  // Monthly rate
  const monthlyRate = rate / 100 / 12;
  // Number of months
  const months = years * 12;
  
  // Formula for future value of recurring deposit
  const futureValue = monthlySaving * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return Math.round(futureValue);
};

// Function to calculate growth percentage
const calculateGrowthPercentage = (monthlySaving: number, rate: number, years: number): string => {
  const totalInvested = monthlySaving * years * 12;
  const futureValue = calculateProjection(monthlySaving, rate, years);
  const growthPercentage = ((futureValue - totalInvested) / totalInvested) * 100;
  
  return growthPercentage.toFixed(1);
};



// Generate insights based on spending patterns
const generateInsights = () => {
  const insights = [];
  
  // Add savings rate insight
  if (savingsPercentage >= 20) {
    insights.push({
      title: "Excellent Savings Rate",
      description: "You're saving more than 20% of your income. This is an excellent foundation for financial freedom.",
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      colorClass: "bg-yellow-50 border-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-500"
    });
  } else if (savingsPercentage >= 10) {
    insights.push({
      title: "Good Savings Rate",
      description: "Saving 10-20% of your income is a solid financial practice. Consider increasing this over time.",
      icon: <ThumbsUp className="h-5 w-5 text-green-500" />,
      colorClass: "bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-500"
    });
  } else if (savingsPercentage > 0) {
    insights.push({
      title: "Improve Your Savings Rate",
      description: "You're saving less than 10% of your income. Try to increase this to build better financial security.",
      icon: <ArrowUp className="h-5 w-5 text-blue-500" />,
      colorClass: "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-500"
    });
  } else {
    insights.push({
      title: "Spending Exceeds Income",
      description: "Your expenses are higher than your income. This is unsustainable long-term and needs immediate attention.",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      colorClass: "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-500"
    });
  }
  
  // Add category-specific insights
  for (const category of expenseCategories) {
    const expense = expenses[category.id] || 0;
    const percentage = totalExpenses > 0 ? (expense / totalExpenses) * 100 : 0;
    
    // Food insights
    if (category.id === "food" && percentage > 30) {
      insights.push({
        title: "High Food Spending",
        description: "Your food expenses are above 30% of your total spending. Consider meal planning to reduce costs.",
        icon: <UtensilsCrossed className="h-5 w-5 text-amber-500" />,
        colorClass: "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-500"
      });
    }
    
    // Housing insights
    if (category.id === "housing" && percentage > 40) {
      insights.push({
        title: "Housing Cost Alert",
        description: "Your housing costs exceed 40% of your expenses. This might be limiting your ability to save and invest.",
        icon: <Home className="h-5 w-5 text-purple-500" />,
        colorClass: "bg-purple-50 border-purple-100 text-purple-800 dark:bg-purple-900/20 dark:border-purple-900/30 dark:text-purple-500"
      });
    }
  }
  
  // Investment opportunity insight based on actual portfolio data
  if (monthlySavings > 1000 && userData?.financialInfo) {
    const portfolioValue = userData.financialInfo.portfolioValue || 0;
    const projectedValue = portfolioValue + calculateProjection(monthlySavings, saviumRate, 5);
    
    insights.push({
      title: "Portfolio Growth Opportunity",
      description: `Adding your monthly savings of ₹${monthlySavings.toLocaleString()} to your current portfolio could grow it to ₹${projectedValue.toLocaleString()} in 5 years.`,
      icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
      colorClass: "bg-indigo-50 border-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-900/30 dark:text-indigo-500"
    });
  }
  
  // Add any custom insights we've calculated earlier
  if (customInsights.length > 0) {
    insights.push(...customInsights);
  }
  
  // Return only up to 4 insights
  const limitedInsights = insights.slice(0, 4);
  
  return limitedInsights.map((insight, index) => (
    <div key={index} className={`border rounded-lg p-4 ${insight.colorClass}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-white/80 p-1.5 rounded-full">
          {insight.icon}
        </div>
        <h3 className="font-medium">{insight.title}</h3>
      </div>
      <p className="text-sm">{insight.description}</p>
    </div>
  ));
};

  // Add these helper functions for Base64 encoding
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Function to check file size in MB
  const getFileSizeInMB = (file: File): number => {
    return file.size / (1024 * 1024);
  };
  // Helper function to calculate estimated completion date based on current progress
const calculateEstimatedCompletion = (currentAmount: number, targetAmount: number): string => {
  // If no progress yet, return a default date
  if (currentAmount <= 0) return "Not yet determined";
  
  // Get monthly savings if we calculated it, otherwise estimate based on portfolio value
  const monthlySavingEstimate = monthlySavings > 0 
    ? monthlySavings 
    : (userData?.financialInfo?.portfolioValue || 0) * 0.05; // Estimate 5% monthly contribution
  
  // If no estimated monthly savings, return a default message
  if (monthlySavingEstimate <= 0) return "Set savings targets to predict";
  
  // Calculate how much more is needed
  const amountNeeded = targetAmount - currentAmount;
  
  // Calculate months needed
  const monthsNeeded = Math.ceil(amountNeeded / monthlySavingEstimate);
  
  // Get current date and add months
  const currentDate = new Date();
  const targetDate = new Date(currentDate.setMonth(currentDate.getMonth() + monthsNeeded));
  
  // Format the date
  return targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
};

  // Replace the handleFileUpload function with this Base64 version
  const handleFileUpload = async (): Promise<Array<{
    dataUrl: string;
    name: string;
    type: string;
    size: number;
  }>> => {
    if (emergencyDocs.length === 0) return [];
    
    setUploadingFiles(true);
    const fileData: Array<{
      dataUrl: string;
      name: string;
      type: string;
      size: number;
    }> = [];
    
    try {
      // Process each file
      for (let i = 0; i < emergencyDocs.length; i++) {
        const { file } = emergencyDocs[i];
        const fileSize = getFileSizeInMB(file);
        
        // Check file size - reject files over 1MB
        if (fileSize > 1) {
          throw new Error(`File ${file.name} exceeds the 1MB limit. Please compress or resize your files.`);
        }
        
        // Update progress for UI feedback
        setUploadProgress(Math.round((i / emergencyDocs.length) * 100));
        
        // Convert to Base64
        const dataUrl = await fileToBase64(file);
        
        fileData.push({
          dataUrl,
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        // Update progress again
        setUploadProgress(Math.round(((i + 1) / emergencyDocs.length) * 100));
      }
      
      return fileData;
    } catch (error) {
      console.error("Error processing files:", error);
      throw error;
    } finally {
      setUploadingFiles(false);
      setUploadProgress(0);
      
      // Release all object URLs to avoid memory leaks
      emergencyDocs.forEach(doc => {
        if (doc.preview) URL.revokeObjectURL(doc.preview);
      });
      setEmergencyDocs([]);
    }
  };

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

  // Replace the fetchWithdrawalPrediction function with this updated version
  const fetchWithdrawalPrediction = async () => {
    setPredictionLoading(true);

    try {
      // Prepare data for the prediction/eligibility request
      const predictionData = {
        userId: currentUser?.uid,
        accountAge: userData?.createdAt ?
          Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        portfolioValue: userData?.financialInfo?.portfolioValue || 0,
        totalInvested: userData?.financialInfo?.totalInvested || 0,
        isFirstWithdrawal: !userData?.financialInfo?.lastWithdrawalDate,
        daysSinceLastWithdrawal: userData?.financialInfo?.lastWithdrawalDate ?
          Math.floor((Date.now() - new Date(userData.financialInfo.lastWithdrawalDate).getTime()) / (1000 * 60 * 60 * 24)) : null,
        withdrawalFrequency: calculateWithdrawalFrequency(),
        dayOfWeek: new Date().getDay(),
        bankTransferSelected: withdrawMethod === 'bank',
        userCountry: 'IN', // Assuming India as default
        userTier: userData?.accountStatus || 'standard'
      };

      // In a production app, you'd make a real API call:
      /*
      const response = await fetch('/api/withdrawals/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify(predictionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch eligibility');
      }
      
      const data = await response.json();
      setWithdrawalEligibility(data);
      */

      // For now, use a mock response based on certain factors
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log("Withdrawal eligibility request sent with data:", predictionData);

      // Mock eligibility check logic
      let eligible = true;
      let reason = undefined;
      const processingDays = 1;

      // Example rules for eligibility - replace with your actual rules
      const accountAge = predictionData.accountAge;
      const lastWithdrawalDays = predictionData.daysSinceLastWithdrawal;

      if (accountAge < 7) {
        eligible = false;
        reason = "Accounts less than 7 days old cannot make withdrawals";
      } else if (lastWithdrawalDays !== null && lastWithdrawalDays < 3) {
        eligible = false;
        reason = "You can only make one withdrawal every 3 days";
      }

      setWithdrawalEligibility({
        eligible,
        reason,
        processingDays
      });

    } catch (error) {
      console.error("Error fetching withdrawal eligibility:", error);
      // Default to eligible with a warning
      setWithdrawalEligibility({
        eligible: true,
        reason: "Could not verify eligibility. Proceed with caution.",
        processingDays: 1
      });
    } finally {
      setPredictionLoading(false);
    }
  };

  // Helper function to calculate withdrawal frequency
  const calculateWithdrawalFrequency = () => {
    // This would typically be calculated from historical data
    // For now, just a placeholder
    if (!userData?.financialInfo?.lastWithdrawalDate) return 'first';

    const now = new Date().getTime();
    const lastWithdrawal = new Date(userData.financialInfo.lastWithdrawalDate).getTime();
    const daysDiff = Math.floor((now - lastWithdrawal) / (1000 * 60 * 60 * 24));

    if (daysDiff < 7) return 'frequent';
    if (daysDiff < 30) return 'moderate';
    return 'infrequent';
  };

  // Modify your state setter for the modal to call the prediction API
  const openWithdrawalModal = () => {
    setShowWithdrawModal(true);
    fetchWithdrawalPrediction(); // Call the prediction API when opening the modal
  };

  // Add this function to handle file selection with previews
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setEmergencyDocs(prev => [...prev, ...newFiles]);
    e.target.value = ''; // Reset input to allow selecting the same file again
  }

  // Add this function to remove a selected file
  const removeFile = (indexToRemove: number) => {
    setEmergencyDocs(prev => {
      const newFiles = [...prev];
      // Release the object URL to avoid memory leaks
      if (newFiles[indexToRemove].preview) {
        URL.revokeObjectURL(newFiles[indexToRemove].preview);
      }
      newFiles.splice(indexToRemove, 1);
      return newFiles;
    });
  }

  // Modify the handleWithdrawal function to handle emergency withdrawals
  const handleWithdrawal = async () => {
    // Reset error state
    setWithdrawError("")

    // Basic validation
    const amount = parseFloat(withdrawAmount)
    if (!amount || isNaN(amount) || amount <= 0) {
      setWithdrawError("Please enter a valid amount")
      return
    }

    // Check if user has enough funds
    const availableFunds = userData?.financialInfo?.portfolioValue || 0
    if (amount > availableFunds) {
      setWithdrawError("Insufficient funds for withdrawal")
      return
    }

    // Additional validation for emergency withdrawals
    if (isEmergencyWithdrawal) {
      if (!emergencyType) {
        setWithdrawError("Please select an emergency type")
        return
      }

      if (emergencyDescription.length < 20) {
        setWithdrawError("Please provide more details about your emergency (minimum 20 characters)")
        return
      }

      if (emergencyDocs.length === 0) {
        setWithdrawError("Please upload at least one supporting document")
        return
      }
    } else if (!withdrawalEligibility.eligible) {
      setWithdrawError(withdrawalEligibility.reason || "Your account is not eligible for standard withdrawals at this time")
      return
    }

    // Start processing
    setIsProcessingWithdrawal(true)

    try {
      let documentData: Array<{
        dataUrl: string;
        name: string;
        type: string;
        size: number;
      }> = [];
      let documentMetadata: Array<{ name: string, type: string, size: number }> = [];

      // Handle file uploads for emergency withdrawals
      if (isEmergencyWithdrawal && emergencyDocs.length > 0) {
        // Collect metadata before upload
        documentMetadata = emergencyDocs.map(doc => ({
          name: doc.file.name,
          type: doc.file.type,
          size: doc.file.size
        }));

        // Convert files to Base64
        documentData = await handleFileUpload();
      }

      // Create a unique ID for the withdrawal
      const withdrawalId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update Firestore with new balance and withdrawal details
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid)
        const newPortfolioValue = availableFunds - amount

        // Base withdrawal data - this will go into the user document
        const withdrawalData = {
          "financialInfo.portfolioValue": newPortfolioValue,
          "financialInfo.lastWithdrawalDate": new Date().toISOString(),
          "financialInfo.lastWithdrawalAmount": amount
        }

        // Add to withdrawals collection for history tracking
        const withdrawalRef = doc(db, "withdrawals", withdrawalId);
        await setDoc(withdrawalRef, {
          userId: currentUser.uid,
          amount,
          paymentMethod: withdrawMethod,
          status: isEmergencyWithdrawal ? "pending_review" : "processing",
          createdAt: new Date().toISOString(),
          emergency: isEmergencyWithdrawal,
          emailNotified: false,
          document: documentData
        });

        // Add emergency data if applicable
        if (isEmergencyWithdrawal) {
          const emergencyWithdrawalRef = doc(db, "emergencyWithdrawals", withdrawalId);

          // Create a separate document for the emergency withdrawal
          await setDoc(emergencyWithdrawalRef, {
            withdrawalId,
            userId: currentUser.uid,
            userName: userData?.name || "User",
            userEmail: userData?.email || "",
            amount,
            emergencyType,
            description: emergencyDescription,
            documentData,
            documentMetadata,
            status: "pending_review",
            priority: emergencyType === "medical" ? "high" : "normal",
            submittedAt: new Date().toISOString(),
            reviewDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
            paymentMethod: withdrawMethod,
            processed: false,
            reviewNotes: ""
          });
        }

        // Always update the user document with the withdrawal
        await updateDoc(userRef, withdrawalData);

        // Reset form and close modal
        setShowWithdrawModal(false)
        setWithdrawAmount("")
        setIsEmergencyWithdrawal(false)
        setEmergencyType("")
        setEmergencyDescription("")
        setEmergencyDocs([])
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error)
      setWithdrawError("Failed to process withdrawal. Please try again.")
    } finally {
      setIsProcessingWithdrawal(false)
    }
  }

  // Show loading state while auth is initializing or data is loading
  if (!authInitialized || (currentUser && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center flex flex-col items-center max-w-md">
          <div className="w-64 h-64 mb-6 relative">
            {/* Replace the standard Spline component with our watermark remover */}
            <SplineWatermarkRemover
              scene="https://prod.spline.design/pGexrSIOmQF3Z2oz/scene.splinecode"
              className="w-full h-full"
            />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Preparing Your Dashboard</h2>
          <p className="text-muted-foreground">Loading your financial insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop only) */}
        <aside className="hidden border-r bg-gradient-to-b from-background to-muted/30 md:block w-[240px]">
          <div className="flex flex-col h-full">
            {/* Logo and brand */}
            <div className="p-4 border-b flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                 >
                  <Image 
                    src="/savium-logo1.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-cover rounded-md"
                    onClick={() => router.push('/')}
                  />  
                </div>
                <span className="font-semibold text-xl">$avium</span>
              </div>
            </div>
            
            {/* Navigation items */}
            <nav className="flex-1 py-6 px-4 space-y-1">
              <div className="text-xs uppercase text-muted-foreground font-medium tracking-wider mb-3 px-2">
                Main Menu
              </div>
              
              <Button 
                onClick={() => setActiveTab('overview')}
                variant={activeTab === 'overview' ? "default" : "ghost"}
                className={`w-full justify-start text-base font-normal ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent hover:text-accent-foreground'}`}
              >
                <Home className="h-[18px] w-[18px] mr-3" />
                <span>Dashboard</span>
              </Button>
              
              <Button
                onClick={() => setActiveTab('accounts')}
                variant={activeTab === 'accounts' ? "default" : "ghost"}
                className={`w-full justify-start text-base font-normal ${activeTab === 'accounts' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent hover:text-accent-foreground'}`}
              >
                <CreditCard className="h-[18px] w-[18px] mr-3" />
                <span>Accounts</span>
              </Button>
              
              <Button
                onClick={() => setActiveTab('goals')}
                variant={activeTab === 'goals' ? "default" : "ghost"}
                className={`w-full justify-start text-base font-normal ${activeTab === 'goals' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent hover:text-accent-foreground'}`}
              >
                <Target className="h-[18px] w-[18px] mr-3" />
                <span>Investment Goals</span>
              </Button>
              
              <Button
                onClick={() => setActiveTab('sectors')}
                variant={activeTab === 'sectors' ? "default" : "ghost"}
                className={`w-full justify-start text-base font-normal ${activeTab === 'sectors' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent hover:text-accent-foreground'}`}
              >
                <PieChart className="h-[18px] w-[18px] mr-3" />
                <span>Preferred Sectors</span>
              </Button>

              <div className="text-xs uppercase text-muted-foreground font-medium tracking-wider mt-6 mb-3 px-2">
                Management
              </div>
              
              <Button
                onClick={() => router.push('/settings')}
                variant="ghost"
                className="w-full justify-start text-base font-normal hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="h-[18px] w-[18px] mr-3" />
                <span>Settings</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-base font-normal hover:bg-accent hover:text-accent-foreground"
                onClick={handleThemeToggle}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-[18px] w-[18px] mr-3" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-[18px] w-[18px] mr-3" />
                    <span>Dark Mode</span>
                  </>
                )}
              </Button>
            </nav>
            
            {/* User profile section */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                  {userData?.photoURL ? (
                    <Image src={userData.photoURL} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-medium text-lg">{userData?.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{userData?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{userData?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => signOut(auth).then(() => router.push("/login"))}
                >
                  <LogOut className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            <div className="flex gap-4">
              <Button variant="default" onClick={() => router.push(`/deposit/${currentUser?.uid}`)}>Deposit</Button>
              <Button variant="outline" onClick={openWithdrawalModal}>Withdraw</Button>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="accounts">Accounts</TabsTrigger>
                <TabsTrigger value="goals">Investment Goals</TabsTrigger>
                <TabsTrigger value="sectors">Preferred Sectors</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab (existing content) */}
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
              </div>
            </TabsContent>

            {/* Accounts Tab - Shows Transactions History */}
            <TabsContent value="accounts" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your complete financial activity</CardDescription>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter transactions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="deposits">Deposits Only</SelectItem>
                      <SelectItem value="withdrawals">Withdrawals Only</SelectItem>
                      <SelectItem value="emergency">Emergency Requests</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {/* Transactions List Component */}
                  <TransactionsList userId={userData?.userId} db={db} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Investment Goals Tab */}
            <TabsContent value="goals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Investment Goals</CardTitle>
                  <CardDescription>Track progress towards your financial objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Goal 1: Retirement Fund */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Retirement Fund</h3>
                        </div>
                        <Badge>Long-term</Badge>
                      </div>
                      {userData?.financialInfo?.portfolioValue ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              ₹{Math.min(userData.financialInfo.portfolioValue, 1000000).toLocaleString()} / ₹10,00,000
                            </span>
                            <span className="text-primary font-medium">
                              {Math.min(Math.round((userData.financialInfo.portfolioValue / 1000000) * 100), 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(Math.round((userData.financialInfo.portfolioValue / 1000000) * 100), 100)} 
                            className="h-2" 
                          />
                          <p className="text-xs text-muted-foreground">
                            {userData.financialInfo.portfolioValue < 1000000 
                              ? `Estimated completion: ${calculateEstimatedCompletion(userData.financialInfo.portfolioValue, 1000000)}`
                              : "Goal achieved! Consider increasing your target."
                            }
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">₹0 / ₹10,00,000</span>
                            <span className="text-primary font-medium">0%</span>
                          </div>
                          <Progress value={0} className="h-2" />
                          <p className="text-xs text-muted-foreground">Start investing to track progress</p>
                        </>
                      )}
                    </div>

                    {/* Goal 2: Home Down Payment */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Home Down Payment</h3>
                        </div>
                        <Badge>Medium-term</Badge>
                      </div>
                      {userData?.financialInfo?.portfolioValue ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              ₹{Math.min(userData.financialInfo.portfolioValue / 2, 800000).toLocaleString()} / ₹8,00,000
                            </span>
                            <span className="text-primary font-medium">
                              {Math.min(Math.round((userData.financialInfo.portfolioValue / 2 / 800000) * 100), 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(Math.round((userData.financialInfo.portfolioValue / 2 / 800000) * 100), 100)} 
                            className="h-2" 
                          />
                          <p className="text-xs text-muted-foreground">
                            {userData.financialInfo.portfolioValue / 2 < 800000 
                              ? `Estimated completion: ${calculateEstimatedCompletion(userData.financialInfo.portfolioValue / 2, 800000)}`
                              : "Goal achieved! Consider your next steps."
                            }
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">₹0 / ₹8,00,000</span>
                            <span className="text-primary font-medium">0%</span>
                          </div>
                          <Progress value={0} className="h-2" />
                          <p className="text-xs text-muted-foreground">Start investing to track progress</p>
                        </>
                      )}
                    </div>

                    {/* Goal 3: Emergency Fund - Always show as completed if user has any portfolio value */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Emergency Fund</h3>
                        </div>
                        {userData?.financialInfo?.portfolioValue && userData.financialInfo.portfolioValue >= 300000 ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
                        ) : (
                          <Badge>Short-term</Badge>
                        )}
                      </div>
                      {userData?.financialInfo?.portfolioValue ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              ₹{Math.min(userData.financialInfo.portfolioValue / 3, 300000).toLocaleString()} / ₹3,00,000
                            </span>
                            <span className={userData.financialInfo.portfolioValue / 3 >= 300000 ? "text-green-500 font-medium" : "text-primary font-medium"}>
                              {Math.min(Math.round((userData.financialInfo.portfolioValue / 3 / 300000) * 100), 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(Math.round((userData.financialInfo.portfolioValue / 3 / 300000) * 100), 100)} 
                            className={userData.financialInfo.portfolioValue / 3 >= 300000 ? "h-2 bg-muted [&>div]:bg-green-500" : "h-2"} 
                          />
                          <p className="text-xs text-muted-foreground">
                            {userData.financialInfo.portfolioValue / 3 < 300000 
                              ? `Estimated completion: ${calculateEstimatedCompletion(userData.financialInfo.portfolioValue / 3, 300000)}`
                              : `Completed on: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`
                            }
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">₹0 / ₹3,00,000</span>
                            <span className="text-primary font-medium">0%</span>
                          </div>
                          <Progress value={0} className="h-2" />
                          <p className="text-xs text-muted-foreground">Start investing to track progress</p>
                        </>
                      )}
                    </div>
                    
                    <Button className="w-full mt-4 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Set New Investment Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferred Sectors Tab */}
              <TabsContent value="sectors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Preferences</CardTitle>
                    <CardDescription>Your preferred sectors and asset allocation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Current Allocation</h3>
                        <div className="w-full h-8 rounded-full overflow-hidden flex">
                          <div className="h-full bg-blue-500 w-[35%] relative group cursor-pointer">
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">35% Tech</span>
                          </div>
                          <div className="h-full bg-green-500 w-[25%] relative group cursor-pointer">
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">25% Healthcare</span>
                          </div>
                          <div className="h-full bg-amber-500 w-[20%] relative group cursor-pointer">
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">20% Financials</span>
                          </div>
                          <div className="h-full bg-purple-500 w-[15%] relative group cursor-pointer">
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">15% Consumer</span>
                          </div>
                          <div className="h-full bg-gray-400 w-[5%] relative group cursor-pointer">
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">5% Other</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Technology (35%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Healthcare (25%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
                            <span className="text-sm">Financial (20%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                            <span className="text-sm">Consumer (15%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                            <span className="text-sm">Other (5%)</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium mb-3 text-sm">Your Preferred Sectors</h3>
                        <div className="flex flex-wrap gap-2">
                          {userData?.investmentProfile?.preferredSectors?.map((sector, i) => (
                            <Badge key={i} variant="secondary" className="px-3 py-1">
                              {sector}
                            </Badge>
                          )) || (
                            <>
                              <Badge variant="secondary" className="px-3 py-1">Technology</Badge>
                              <Badge variant="secondary" className="px-3 py-1">Healthcare</Badge>
                              <Badge variant="secondary" className="px-3 py-1">Financial Services</Badge>
                              <Badge variant="secondary" className="px-3 py-1">Consumer Goods</Badge>
                              <Badge variant="secondary" className="px-3 py-1">Renewable Energy</Badge>
                            </>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowSectorsModal(true)}>
                          Update Preferences
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="flex justify-between mb-3">
                          <h3 className="font-medium text-sm">Risk Tolerance</h3>
                          {isSavingRiskProfile ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-500/30 dark:text-yellow-500">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Saving...
                            </Badge>
                          ) : riskProfileUpdated ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              Saved
                            </Badge>
                          ) : null}
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="relative w-full h-2 bg-muted rounded-full">
                              <div 
                                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-primary" 
                                style={{ width: `${riskProfile}%` }}
                              ></div>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                value={riskProfile}
                                onChange={handleRiskProfileChange}
                                onMouseUp={saveRiskProfile}
                                onTouchEnd={saveRiskProfile}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                aria-label="Risk profile"
                              />
                              <div 
                                className="absolute h-4 w-4 rounded-full border-2 border-white bg-primary top-1/2 -translate-y-1/2 shadow-md" 
                                style={{ left: `${riskProfile}%`, transform: 'translateY(-50%) translateX(-50%)' }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium min-w-[100px]">{getRiskProfileLabel(riskProfile)}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 text-center text-xs text-muted-foreground">
                            <div>Conservative</div>
                            <div>Balanced</div>
                            <div>Aggressive</div>
                          </div>
                          
                          <div className="bg-muted/40 p-4 rounded-md">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Info className="h-4 w-4 text-primary" />
                              Your Risk Profile Explained
                            </h4>
                            <p className="text-sm text-muted-foreground">{getRiskProfileDescription(riskProfile)}</p>
                            
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-medium mb-1">Suggested Allocation</h5>
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span>Equity</span>
                                    <span className="font-medium">{getEquityAllocation(riskProfile)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Debt</span>
                                    <span className="font-medium">{getDebtAllocation(riskProfile)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Gold</span>
                                    <span className="font-medium">{getGoldAllocation(riskProfile)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cash</span>
                                    <span className="font-medium">{getCashAllocation(riskProfile)}%</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium mb-1">Expected Annual Returns</h5>
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span>Best Case</span>
                                    <span className="font-medium text-green-600">{getBestCaseReturns(riskProfile)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Average Case</span>
                                    <span className="font-medium">{getAverageReturns(riskProfile)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Worst Case</span>
                                    <span className="font-medium text-red-600">{getWorstCaseReturns(riskProfile)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>            {/* Analytics Tab (existing content) */}
            {/* Analytics Tab - Enhanced with Expense Analysis and Investment Projections */}
            <TabsContent value="analytics" className="space-y-4">
              {/* Expense Tracker Section */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-3 md:col-span-1">
                  <CardHeader>
                    <CardTitle>Monthly Income & Expenses</CardTitle>
                    <CardDescription>Track your financial flow</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthly-income">Monthly Income (₹)</Label>
                      <div className="relative">
                        <Input
                          id="monthly-income"
                          type="number"
                          placeholder="Enter your monthly salary"
                          value={monthlyIncome || ''}
                          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                          className="pl-7"
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <Label>Monthly Expenses</Label>
                      
                      {expenseCategories.map((category) => (
                        <div key={category.id} className="grid grid-cols-5 gap-2 items-center">
                          <div className="col-span-2 flex items-center gap-2">
                            {category.icon}
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <div className="relative col-span-3">
                            <Input
                              type="number"
                              placeholder="0"
                              value={expenses[category.id] || ''}
                              onChange={(e) => handleExpenseChange(category.id, Number(e.target.value))}
                              className="pl-7"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t mt-6">
                      <Button 
                        className="w-full" 
                        onClick={calculateSavings}
                        disabled={!monthlyIncome}
                      >
                        <CircleDollarSign className="mr-2 h-4 w-4" />
                        Calculate Potential Savings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Where your money goes each month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[340px] flex items-center justify-center">
                    {totalExpenses > 0 ? (
                      <div className="w-full h-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Total Expenses:</div>
                            <div className="text-2xl font-bold text-primary">₹{totalExpenses.toLocaleString()}</div>
                          </div>
                          <div className="space-y-1 text-right">
                            <div className="text-sm font-medium">Monthly Savings:</div>
                            <div className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ₹{monthlySavings.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="h-64">
                          {/* Replace with actual expense breakdown chart */}
                          <div className="relative h-full">
                            {/* Chart legend */}
                            <div className="absolute top-0 right-0 space-y-1">
                              {expenseCategories.map((category) => (
                                expenses[category.id] ? (
                                  <div key={category.id} className="flex items-center text-xs">
                                    <div 
                                      className="w-3 h-3 mr-1.5" 
                                      style={{ backgroundColor: category.color }}
                                    ></div>
                                    <span>{category.name} ({((expenses[category.id] / totalExpenses) * 100).toFixed(0)}%)</span>
                                  </div>
                                ) : null
                              ))}
                            </div>
                            
                            {/* Donut chart */}
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="relative w-60 h-60">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                  {/* Pie chart segments will be rendered here */}
                                  {renderPieChart()}
                                </svg>
                                {/* Center text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <p className="text-xs text-muted-foreground">Monthly Income</p>
                                  <p className="text-xl font-bold">₹{monthlyIncome.toLocaleString()}</p>
                                  {savingsPercentage !== null && (
                                    <p className={`text-sm font-medium ${savingsPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {savingsPercentage >= 0 ? `${savingsPercentage}% saved` : `${Math.abs(savingsPercentage)}% overspent`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center opacity-70 flex flex-col items-center">
                        <PieChart className="h-12 w-12 mb-3 text-muted-foreground" strokeWidth={1.5} />
                        <p>Enter your income and expenses to see your financial breakdown</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Projection Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Growth Comparison</CardTitle>
                  <CardDescription>
                    See how your potential savings would grow over time with different investment options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlySavings > 0 ? (
                    <div className="space-y-6">
                      {/* Timeline selector */}
                      <div className="flex justify-center space-x-1 mb-4 bg-muted p-1 rounded-lg max-w-md mx-auto">
                        {[1, 3, 5, 10, 20].map((year) => (
                          <Button
                            key={year}
                            variant={projectionYears === year ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setProjectionYears(year)}
                            className={`${projectionYears === year ? 'bg-primary text-primary-foreground' : ''} flex-1`}
                          >
                            {year} {year === 1 ? 'Year' : 'Years'}
                          </Button>
                        ))}
                      </div>
                      
                      {/* Growth chart */}
                      <div className="h-[300px] relative">
                        {/* Projection chart would go here - simplified visualization */}
                        <div className="absolute inset-0">
                          {/* Vertical grid lines */}
                          <div className="grid grid-cols-5 h-full">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <div key={i} className="border-r border-dashed border-gray-200 h-full"></div>
                            ))}
                          </div>
                          
                          {/* Horizontal grid lines */}
                          <div className="grid grid-rows-4 w-full h-full">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="border-t border-dashed border-gray-200 w-full"></div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Investment growth lines */}
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* Line for Savium */}
                          <path
                            d={calculateGrowthPath(saviumRate, "high")}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                          />
                          
                          {/* Line for Mutual Funds */}
                          <path
                            d={calculateGrowthPath(mutualFundRate, "medium")}
                            stroke="#10b981"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                          />
                          
                          {/* Line for Gold */}
                          <path
                            d={calculateGrowthPath(debtMutualFunds, "low")}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                          />
                          
                          {/* Line for Bank FD */}
                          <path
                            d={calculateGrowthPath(bankFDRate, "lowest")}
                            stroke="#6b7280"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        {/* Labels at the end of lines */}
                        <div className="absolute top-2 right-4 space-y-3">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium">Savium ({saviumRate}%)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium">Mutual Funds ({mutualFundRate}%)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium">Debt Mutual Funds ({debtMutualFunds}%)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium">Bank FD ({bankFDRate}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Comparison Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium">Investment Option</th>
                              <th className="text-right py-3 px-4 font-medium">Monthly Investment</th>
                              <th className="text-right py-3 px-4 font-medium">Rate</th>
                              <th className="text-right py-3 px-4 font-medium">After {projectionYears} {projectionYears === 1 ? 'Year' : 'Years'}</th>
                              <th className="text-right py-3 px-4 font-medium">Total Growth</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b bg-blue-50/40 dark:bg-blue-900/10">
                              <td className="py-3 px-4 font-medium">Savium</td>
                              <td className="text-right py-3 px-4">₹{monthlySavings.toLocaleString()}</td>
                              <td className="text-right py-3 px-4">{saviumRate}%</td>
                              <td className="text-right py-3 px-4 font-bold">
                                ₹{(userData?.financialInfo?.portfolioValue || 0 + calculateProjection(monthlySavings, saviumRate, projectionYears)).toLocaleString()}
                              </td>
                              <td className="text-right py-3 px-4 text-green-600 font-medium">
                                +{calculateGrowthPercentage(monthlySavings, saviumRate, projectionYears)}%
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 font-medium">Mutual Funds</td>
                              <td className="text-right py-3 px-4">₹{monthlySavings.toLocaleString()}</td>
                              <td className="text-right py-3 px-4">{mutualFundRate}%</td>
                              <td className="text-right py-3 px-4 font-medium">
                                ₹{calculateProjection(monthlySavings, mutualFundRate, projectionYears).toLocaleString()}
                              </td>
                              <td className="text-right py-3 px-4 text-green-600 font-medium">
                                +{calculateGrowthPercentage(monthlySavings, mutualFundRate, projectionYears)}%
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 font-medium">Debt Mutual Funds</td>
                              <td className="text-right py-3 px-4">₹{monthlySavings.toLocaleString()}</td>
                              <td className="text-right py-3 px-4">{debtMutualFunds}%</td>
                              <td className="text-right py-3 px-4 font-medium">
                                ₹{calculateProjection(monthlySavings, debtMutualFunds, projectionYears).toLocaleString()}
                              </td>
                              <td className="text-right py-3 px-4 text-green-600 font-medium">
                                +{calculateGrowthPercentage(monthlySavings, debtMutualFunds, projectionYears)}%
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 font-medium">Bank FD</td>
                              <td className="text-right py-3 px-4">₹{monthlySavings.toLocaleString()}</td>
                              <td className="text-right py-3 px-4">{bankFDRate}%</td>
                              <td className="text-right py-3 px-4 font-medium">
                                ₹{calculateProjection(monthlySavings, bankFDRate, projectionYears).toLocaleString()}
                              </td>
                              <td className="text-right py-3 px-4 text-green-600 font-medium">
                                +{calculateGrowthPercentage(monthlySavings, bankFDRate, projectionYears)}%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-muted inline-flex rounded-full p-3 mb-4">
                        <CircleDollarSign className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Calculate Your Potential Savings First</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Enter your monthly income and expenses to see how your savings could grow with different investment options.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Financial Insights</CardTitle>
                  <CardDescription>Tailored recommendations based on your spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {totalExpenses > 0 ? (
                    <div className="space-y-4">
                      {/* Spending ratio visualization */}
                      {/* Spending ratio visualization */}
                      <div className="flex items-center gap-2 mb-6">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              savingsPercentage >= 20 ? 'bg-green-500' : 
                              savingsPercentage >= 10 ? 'bg-blue-500' : 
                              savingsPercentage >= 0 ? 'bg-amber-500' : 
                              'bg-red-500'
                            }`} 
                            style={{ width: `${savingsPercentage > 0 ? savingsPercentage : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12">
                          {savingsPercentage > 0 ? `${savingsPercentage}%` : '0%'}
                        </span>
                      </div>
                      
                      {/* Insights based on savings percentage */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {generateInsights()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Complete your expense analysis to get personalized insights
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={(open) => {
        if (!open) {
          // Reset emergency form when closing
          setIsEmergencyWithdrawal(false);
          setEmergencyType("");
          setEmergencyDescription("");
          setEmergencyDocs([]);
        }
        setShowWithdrawModal(open);
      }}>
        <DialogContent className={cn(
          "sm:max-w-[500px]", 
          isEmergencyWithdrawal && "sm:max-w-[600px]"
        )}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              {isEmergencyWithdrawal ? (
                <ShieldAlert className="h-5 w-5 text-red-500" />
              ) : (
                <Wallet className="h-5 w-5 text-primary" />
              )}
              <DialogTitle>
                {isEmergencyWithdrawal ? "Emergency Funds Request" : "Withdraw Funds"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {isEmergencyWithdrawal 
                ? "Request emergency access to your funds. This will be reviewed within 24 hours."
                : "Request a standard withdrawal from your investment account."}
              {userData?.financialInfo?.portfolioValue ? (
                <>
                  <span className="font-medium text-primary">
                    Available balance: 
                  </span>
                  <span className="font-bold text-lg">
                    ₹{userData.financialInfo.portfolioValue.toLocaleString()}
                  </span>
                  </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
            {/* Emergency toggle switch */}
            <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emergency-withdrawal" 
                  checked={isEmergencyWithdrawal}
                  onCheckedChange={(checked) => setIsEmergencyWithdrawal(checked as boolean)}
                />
                <Label 
                  htmlFor="emergency-withdrawal"
                  className="font-medium"
                >
                  This is an emergency withdrawal
                </Label>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-muted rounded-full p-1 cursor-help">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>
                      Emergency withdrawals are processed faster but require 
                      documentation and proof. Only use this for genuine emergencies.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {withdrawError && (
              <div className="bg-destructive/10 text-destructive flex items-center p-3 rounded-md text-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>{withdrawError}</p>
              </div>
            )}

            {!isEmergencyWithdrawal && !withdrawalEligibility.eligible && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-md text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{withdrawalEligibility.reason}</p>
                    <p className="mt-1">You may still qualify for emergency withdrawal if you have an urgent need.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main form area - conditionally show content based on emergency withdrawal */}
            {isEmergencyWithdrawal ? (
              <div className="space-y-4">
                <h3 className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Emergency Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="text-xs text-muted-foreground mb-1.5 block">
                      Withdrawal Amount
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id="amount"
                        placeholder="0.00"
                        className="pl-7"
                        value={withdrawAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '')
                          setWithdrawAmount(value)
                          setWithdrawError("")
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency-type" className="text-xs text-muted-foreground mb-1.5 block">
                      Emergency Type
                    </Label>
                    <Select
                      value={emergencyType}
                      onValueChange={setEmergencyType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select emergency type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="education">Educational Emergency</SelectItem>
                        <SelectItem value="family">Family Emergency</SelectItem>
                        <SelectItem value="housing">Housing Emergency</SelectItem>
                        <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                        <SelectItem value="other">Other Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="emergency-description" className="text-xs text-muted-foreground">
                      Emergency Description
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {emergencyDescription.length}/200 characters
                    </span>
                  </div>
                  <Textarea
                    id="emergency-description"
                    placeholder="Please provide specific details about your emergency situation"
                    value={emergencyDescription}
                    onChange={(e) => setEmergencyDescription(e.target.value)}
                    className="resize-none"
                    maxLength={200}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be as specific as possible to help with faster processing.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Supporting Documents
                    </Label>
                    <Badge variant="outline">{emergencyDocs.length} files</Badge>
                  </div>
                  
                  {emergencyDocs.length > 0 ? (
                    <div className="space-y-2 mb-2">
                      {emergencyDocs.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/40 rounded-md p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {doc.preview ? (
                              <div className="h-10 w-10 rounded bg-background overflow-hidden flex-shrink-0">
                                <Image 
                                  src={doc.preview} 
                                  alt="Preview" 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded bg-background flex items-center justify-center flex-shrink-0">
                                {doc.file.type.includes('pdf') ? (
                                  <FileText className="h-5 w-5 text-red-500" />
                                ) : (
                                  <FileText className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate">{doc.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={documentType}
                        onValueChange={setDocumentType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical_bill">Medical Bill</SelectItem>
                          <SelectItem value="hospital_report">Hospital Report</SelectItem>
                          <SelectItem value="prescription">Medical Prescription</SelectItem>
                          <SelectItem value="govt_id">Government ID</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="other">Other Document</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="relative">
                        <Input
                          id="document-upload"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              // Check file size
                              const file = e.target.files[0];
                              const fileSizeMB = file.size / (1024 * 1024);
                              
                              if (fileSizeMB > 1) {
                                setWithdrawError(`File size exceeds 1MB limit. Please compress your file.`);
                                e.target.value = '';
                                return;
                              }
                              
                              handleFileSelection(e);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <FilePlus className="h-4 w-4" />
                          <span>Add Document</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Upload supporting documents (max 1MB per file). For larger files, please compress or resize them.
                    </p>
                  </div>

                  {uploadingFiles && (
                    <div className="mt-2">
                      <Progress value={uploadProgress} className="h-2"/>
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        Uploading files... {uploadProgress.toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-amber-800 dark:text-amber-400">
                    <Shield className="h-4 w-4" />
                    Emergency Withdrawal Information
                  </h4>
                  <ul className="list-disc pl-5 mt-1.5 text-xs space-y-1 text-amber-800 dark:text-amber-300">
                    <li>Your request will be reviewed within 24 hours</li>
                    <li>Additional verification may be required via email or phone</li>
                    <li>Processing fee is waived for genuine emergencies</li>
                    <li>Misuse of emergency withdrawals may result in account restrictions</li>
                  </ul>
                </div>
                
                <div>
                  <Label htmlFor="withdraw-method" className="text-xs text-muted-foreground mb-1.5 block">
                    Payment Method
                  </Label>
                  <Select
                    value={withdrawMethod}
                    onValueChange={setWithdrawMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {withdrawMethod === "bank" ? (
                  <div>
                    <Label htmlFor="bank-details" className="text-xs text-muted-foreground mb-1.5 block">
                      Bank Account
                    </Label>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="upi-id" className="text-xs text-muted-foreground mb-1.5 block">
                      UPI ID
                    </Label>
                    <Input
                      id="upi-id"
                      placeholder="name@upi"
                      defaultValue={userData?.email?.split('@')[0] + '@upi'}
                    />
                  </div>
                )}
              </div>
            ) : (
              // Standard withdrawal form (non-emergency)
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-xs text-muted-foreground mb-1.5 block">
                    Withdrawal Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="amount"
                      placeholder="0.00"
                      className="pl-7"
                      value={withdrawAmount}
                      onChange={(e) => {
                        // Only allow numbers and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, '')
                        setWithdrawAmount(value)
                        setWithdrawError("")
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="withdraw-method" className="text-xs text-muted-foreground mb-1.5 block">
                    Payment Method
                  </Label>
                  <Select
                    value={withdrawMethod}
                    onValueChange={setWithdrawMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {withdrawMethod === "bank" ? (
                  <div>
                    <Label htmlFor="bank-details" className="text-xs text-muted-foreground mb-1.5 block">
                      Bank Account
                    </Label>
                    <div className="border rounded-md p-3 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">HDFC Bank</p>
                          <p className="text-muted-foreground text-xs">XXXX XXXX 1234</p>
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Bank transfers typically include a small processing fee.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="upi-id" className="text-xs text-muted-foreground mb-1.5 block">
                      UPI ID
                    </Label>
                    <Input
                      id="upi-id"
                      placeholder="name@upi"
                      defaultValue={userData?.email?.split('@')[0] + '@upi'}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      UPI transfers are usually faster than bank transfers.
                    </p>
                  </div>
                )}

                <div className="bg-muted/50 p-3 rounded-md flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Processing Time</h4>
                    <p className="text-sm text-muted-foreground">
                      {predictionLoading ? (
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-muted"></span>
                          Calculating processing time...
                        </span>
                      ) : (
                        <>
                          Your withdrawal will be processed within 
                          <span className="font-semibold text-primary mx-1">
                            {withdrawalEligibility.processingDays} {withdrawalEligibility.processingDays === 1 ? 'day' : 'days'}
                          </span>
                          based on your account activity.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleWithdrawal} 
              disabled={
                isProcessingWithdrawal || 
                !withdrawAmount || 
                (isEmergencyWithdrawal && (
                  !emergencyType || 
                  emergencyDescription.length < 20 || 
                  emergencyDocs.length === 0
                )) ||
                (!isEmergencyWithdrawal && !withdrawalEligibility.eligible)
              }
              variant={isEmergencyWithdrawal ? "destructive" : "default"}
              className={cn(
                "min-w-[120px]",
                isEmergencyWithdrawal && "bg-red-600 hover:bg-red-700"
              )}
            >
              {isProcessingWithdrawal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Processing...
                </>
              ) : (
                <>
                  {isEmergencyWithdrawal ? (
                    <>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Submit Emergency Request
                    </>
                  ) : (
                    "Withdraw Funds"
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Preferred Sectors Update Modal */}
<Dialog open={showSectorsModal} onOpenChange={setShowSectorsModal}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Update Investment Preferences</DialogTitle>
      <DialogDescription>
        Select the sectors you&apos;re interested in investing in
      </DialogDescription>
    </DialogHeader>
    
    <div className="py-4 max-h-[60vh] overflow-y-auto">
      <div className="space-y-4">
        {allSectors.map((sector) => (
          <div key={sector.id} className="flex items-start space-x-3">
            <Checkbox 
              id={`sector-${sector.id}`} 
              checked={selectedSectors.includes(sector.name)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedSectors([...selectedSectors, sector.name]);
                } else {
                  setSelectedSectors(selectedSectors.filter(s => s !== sector.name));
                }
              }}
            />
            <div>
              <Label 
                htmlFor={`sector-${sector.id}`}
                className="text-sm font-medium"
              >
                {sector.name}
              </Label>
              <p className="text-sm text-muted-foreground">{sector.description}</p>
              {sector.historicalReturns && (
                <p className="text-xs text-muted-foreground mt-1">
                  Historical returns: <span className="text-green-600 font-medium">{sector.historicalReturns}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowSectorsModal(false)}
      >
        Cancel
      </Button>
      <Button 
        onClick={updateSectorPreferences}
        disabled={isSavingSectors}
      >
        {isSavingSectors ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  )
}

