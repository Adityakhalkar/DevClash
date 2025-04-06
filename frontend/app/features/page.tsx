"use client"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowRight, 
  BarChart3, 
  Check, 
  CircleDollarSign, 
  Clock, 
  CreditCard,
  LineChart, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Timer, 
  Wallet,
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  BadgePercent,
  Banknote,
  Lock
} from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen items-center">
      {/* Hero section with image */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/50 flex justify-center">
        <div className="container px-4 md:px-6 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          {/* Hero content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                The <span className="text-primary">smarter way</span> to grow your money
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Savium combines stable returns, emergency access, and a simplified experience to help you build financial security confidently.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 justify-center lg:justify-start">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start Investing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#key-features">
                    Explore Features
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Hero image */}
          <div className="relative w-full max-w-md lg:max-w-xl aspect-square">
            <Image
              src="/feature.png"
              alt="Savium Investment Features"
              fill
              priority
              className="object-contain rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Key Features Overview - Everything centered */}
      <section id="key-features" className="w-full py-12 md:py-24 flex justify-center">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Key Features</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                What makes Savium the ideal choice for your investment journey
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
            {/* Feature 1: Stable Returns */}
            <Card className="border border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col items-center text-center">
              <CardHeader className="items-center justify-center">
                <CardTitle className="text-2xl">Stable Returns</CardTitle>
                <CardDescription>Low-risk investment solutions</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  We recommend low-risk investment options like liquid mutual funds to ensure consistent and secure returns on savings.
                </p>
                <ul className="mt-4 space-y-3 flex flex-col items-center">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">Portfolio optimization for steady growth</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">Regular performance reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">Risk-adjusted investment strategies</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2: Emergency Access */}
            <Card className="border border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col items-center text-center">
              <CardHeader className="items-center justify-center">
                <CardTitle className="text-2xl">Emergency Access</CardTitle>
                <CardDescription>Funds when you need them most</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Our emergency withdrawal system allows you to access your investments quickly during unexpected situations with a 24-hour review process.
                </p>
                <ul className="mt-4 space-y-3 flex flex-col items-center">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">24-hour expedited review process</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">Simple documentation upload</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">Waived processing fees for emergencies</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3: Simplified Experience */}
            <Card className="border border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col items-center text-center">
              <CardHeader className="items-center justify-center">
                <CardTitle className="text-2xl">Simplified Experience</CardTitle>
                <CardDescription>Investing made easy</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  With a clean and intuitive interface, users can easily track savings, get personalized tips, and invest confidently—all in one place.
                </p>
                <ul className="mt-4 space-y-3 flex flex-col items-center">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">User-friendly dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">Personalized investment recommendations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-center">One-click investment options</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Detail Tabs - All content centered */}
      <section className="w-full py-12 md:py-24 bg-muted/30 flex justify-center">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">Explore Our Features In-Depth</h2>
            <p className="text-muted-foreground text-lg text-center max-w-[800px]">
              Take a deeper look at how Savium helps you build financial security with confidence and ease.
            </p>
          </div>

          <Tabs defaultValue="returns" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="returns">Stable Returns</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Access</TabsTrigger>
              <TabsTrigger value="experience">Simplified Experience</TabsTrigger>
            </TabsList>
            
            <div className="mt-8 border rounded-lg bg-card p-6 md:p-8">
              {/* Tab 1: Stable Returns */}
              <TabsContent value="returns" className="space-y-8">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-semibold mb-4 text-center">Stable, Consistent Growth</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-2xl">
                    We prioritize investment stability over risky high-return options, focusing on reliable growth that builds wealth steadily over time.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="mx-auto max-w-md">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BadgePercent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Optimized Portfolio Management</h4>
                          <p className="text-sm text-muted-foreground">
                            Our investment experts carefully select and monitor funds to maintain consistent performance.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Low-Risk Mutual Funds</h4>
                          <p className="text-sm text-muted-foreground">
                            We focus on liquid mutual funds and other stable instruments that provide reliable returns.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <LineChart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Performance Transparency</h4>
                          <p className="text-sm text-muted-foreground">
                            Regular reports and insights keep you informed about how your investments are performing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-[300px] md:h-[350px] bg-muted rounded-lg overflow-hidden mx-auto w-full max-w-md">
                    {/* Stable growth chart visualization - Simple CSS version */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full max-w-md">
                          <div className="h-[200px] relative">
                            <div className="absolute bottom-0 left-0 right-0 bg-muted-foreground/10 h-[180px] rounded-md overflow-hidden">
                              <div className="absolute bottom-0 left-0 w-full h-[70%] bg-gradient-to-t from-primary/40 to-primary/5"></div>
                              <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/30"></div>
                              <div className="absolute bottom-[25%] left-0 right-0 h-px bg-primary/20"></div>
                              <div className="absolute bottom-[50%] left-0 right-0 h-px bg-primary/20"></div>
                              <div className="absolute bottom-[75%] left-0 right-0 h-px bg-primary/20"></div>
                              
                              {/* Stable growth line */}
                              <div className="absolute bottom-[40px] left-0 right-0 h-1 bg-primary rounded-full
                                transform translate-y-[60px] skew-y-[0.5deg] 
                                animate-pulse"></div>
                              
                              <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">Low volatility</div>
                              <div className="absolute top-2 right-4 text-xs text-primary font-medium">Steady growth</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab 2: Emergency Access */}
              <TabsContent value="emergency" className="space-y-8">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-semibold mb-4 text-center">Quick Access in Emergencies</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-2xl">
                    Life is unpredictable. Our emergency withdrawal system ensures you can access funds when you need them most, without excessive delays.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="mx-auto max-w-md">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Timer className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">24-Hour Review Process</h4>
                          <p className="text-sm text-muted-foreground">
                            Emergency withdrawal requests are processed within 24 hours to provide quick access during urgent situations.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <AlertCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Multiple Emergency Categories</h4>
                          <p className="text-sm text-muted-foreground">
                            Our system supports various types of emergencies including medical, educational, family, and housing situations.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Banknote className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Fee Waivers for Emergencies</h4>
                          <p className="text-sm text-muted-foreground">
                            Processing fees are waived for genuine emergency withdrawals to help during difficult times.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-[300px] md:h-[450px] bg-muted rounded-lg overflow-hidden border border-muted p-6 mx-auto w-full max-w-md">
                    {/* Emergency withdrawal flow visualization */}
                    <div className="h-full w-full flex flex-col justify-center items-center">
                      <div className="w-full max-w-sm space-y-14 relative">
                        {/* Step 1: Request Emergency Access */}
                        <div className="relative">
                          <p className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-medium text-center text-primary text-sm">
                            Request Emergency Access
                          </p>
                          <div className="bg-card z-100 rounded-lg p-4 shadow-sm border border-border flex items-center gap-3">
                            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                              <ShieldAlert className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Submit details and documentation</p>
                            </div>
                          </div>
                          
                          <div className="h-5 flex items-center justify-center">
                            <div className="h-full w-px bg-muted-foreground/30"></div>
                          </div>
                        </div>
                        
                        {/* Step 2: 24-Hour Review */}
                        <div className="relative">
                          <p className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-medium text-center text-primary text-sm">
                            24-Hour Review
                          </p>
                          <div className="bg-card rounded-lg p-4 shadow-sm border border-border flex items-center gap-3">
                            <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
                              <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Quick verification process</p>
                            </div>
                          </div>
                          
                          <div className="h-10 flex items-center justify-center">
                            <div className="h-full w-px bg-muted-foreground/30"></div>
                          </div>
                        </div>
                        
                        {/* Step 3: Funds Released */}
                        <div className="relative">
                          <p className="absolute -top-7 left-1/2 transform -translate-x-1/2 font-medium text-center text-primary text-sm">
                            Funds Released
                          </p>
                          <div className="bg-card rounded-lg p-4 shadow-sm border border-border flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                              <Wallet className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Money transferred to your account</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab 3: Simplified Experience */}
              <TabsContent value="experience" className="space-y-8">
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-semibold mb-4 text-center">Intuitive Investment Experience</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-2xl">
                    Our platform is designed with simplicity in mind, making investing accessible for everyone regardless of their financial expertise.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="mx-auto max-w-md">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <LayoutDashboard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Clean, Intuitive Dashboard</h4>
                          <p className="text-sm text-muted-foreground">
                            Track your investments, growth, and financial health with our easy-to-use dashboard.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">One-Click Transactions</h4>
                          <p className="text-sm text-muted-foreground">
                            Invest, withdraw, and manage your portfolio with simple, streamlined processes.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Personalized Financial Tips</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive tailored recommendations based on your financial goals and investment patterns.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-[300px] md:h-[350px] bg-muted rounded-lg overflow-hidden mx-auto w-full max-w-md">
                    {/* Dashboard visualization */}
                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                      <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden border border-border">
                        <div className="p-4 border-b border-border">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">Your Portfolio</div>
                            <div className="text-sm text-primary">₹1,24,500</div>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                          {/* Investment card */}
                          <div className="bg-muted/40 p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Liquid Fund</div>
                              <div className="text-sm text-green-500">+5.8%</div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs text-muted-foreground">Invested: ₹50,000</div>
                              <div className="text-sm">₹52,900</div>
                            </div>
                          </div>
                          
                          {/* Another investment */}
                          <div className="bg-muted/40 p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Debt Fund</div>
                              <div className="text-sm text-green-500">+4.2%</div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs text-muted-foreground">Invested: ₹70,000</div>
                              <div className="text-sm">₹72,940</div>
                            </div>
                          </div>
                          
                          {/* CTA */}
                          <div className="pt-2">
                            <Button variant="outline" className="w-full">
                              <CircleDollarSign className="mr-2 h-4 w-4" />
                              Add Investment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* CTA Section - Centered */}
      <section className="w-full py-12 md:py-24 bg-primary/5 flex justify-center">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to start investing smarter?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of investors who trust Savium for stable returns and financial peace of mind.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/login">
                  Create Account
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                window.location.href = "mailto:khalkaraditya8@gmail.com?subject=Inquiry%20about%20Savium%20Investment%20Platform&body=Hello%2C%0A%0AI'm%20interested%20in%20learning%20more%20about%20Savium.%20Please%20contact%20me%20to%20discuss%20your%20investment%20options.%0A%0AThank%20you%2C";
                }}>
                Talk to an Expert
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}