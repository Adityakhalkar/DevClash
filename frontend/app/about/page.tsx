"use client";
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowRight, 
  Building, 
  CheckCircle, 
  CircleDollarSign, 
  Clock, 
  Users,
  User,
  Target,
  Trophy,
  TrendingUp,
  Sparkles,
  Heart,
  BarChart4,
  Rocket,
  GraduationCap
} from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Prajwal",
      role: "Team Lead",
      bio: "With exceptional leadership skills and technical vision, Prajwal guides our team toward excellence.",
      avatar: "/team/placeholder.png",
      icon: <Rocket className="h-5 w-5" />
    },
    {
      name: "Aditya",
      role: "Full Stack Developer",
      bio: "Aditya brings extensive expertise in both frontend and backend technologies.",
      avatar: "/team/placeholder.png",
      icon: <Sparkles className="h-5 w-5" />
    },
    {
      name: "Kashish",
      role: "Full Stack Developer",
      bio: "As a versatile developer proficient in multiple programming languages and frameworks, Kashish crafts intuitive user interfaces and scalable backend systems.",
      avatar: "/team/placeholder.png", 
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      name: "Sanika",
      role: "Data Science Engineer",
      bio: "Sanika transforms complex data into actionable insights.",
      avatar: "/team/placeholder.png",
      icon: <BarChart4 className="h-5 w-5" />
    },
    {
      name: "Omkar",
      role: "Data Science Engineer",
      bio: "With a strong foundation in statistical analysis and predictive modeling, Omkar excels at identifying patterns and extracting meaningful information from data.",
      avatar: "/team/placeholder.png",
      icon: <GraduationCap className="h-5 w-5" />
    },
  ];

  return (
    <div className="flex flex-col min-h-screen items-center">
      {/* Hero section */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/50 flex justify-center">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Building the <span className="text-primary">future of investing</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              We&apos;re a team of passionate professionals dedicated to making financial growth accessible through stable returns, emergency access, and a simplified experience.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 justify-center">
              <Button asChild size="lg">
                <Link href="/register">
                  Join Our Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#team">
                  Meet Our Team
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Values */}
      <section className="w-full py-12 md:py-24 flex justify-center">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Mission & Values</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
              Savium was born from a simple idea: investing shouldn&apos;t be complicated or inaccessible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
            <Card className="border border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col items-center text-center">
              <CardHeader className="items-center">
                <div className="mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  To democratize investing by providing a platform that offers stable returns, emergency access, and an intuitive experience for all investors, regardless of their financial background.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col items-center text-center">
              <CardHeader className="items-center">
                <div className="mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Our Approach</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  We focus on low-risk investment options that provide consistent returns, while building technology that makes accessing and managing your investments simple and transparent.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col items-center text-center">
              <CardHeader className="items-center">
                <div className="mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Our Values</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Transparency in everything we do, accessibility for all investors, and an unwavering commitment to providing financial security that adapts to life&apos;s unpredictability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="w-full py-12 md:py-24 bg-muted/30 flex justify-center">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg text-center max-w-[800px]">
              A diverse group of passionate experts dedicated to transforming how people invest and grow their wealth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 text-center">
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24 bg-muted rounded-full border-4 border-background shadow-md flex items-center justify-center">
                      <div className="text-2xl font-bold text-primary">
                        {member.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                  <p className="text-sm text-primary font-medium">{member.role}</p>
                </div>
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {member.icon}
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="w-full py-12 md:py-24 flex justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Story</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Through extensive research and development, we&apos;ve crafted a solution that provides stable returns without unnecessary risk, emergency access when life demands it, and a simplified experience that makes investing approachable for everyone.
                </p>
                <p className="text-muted-foreground">
                  Today, we&apos;re proud to serve thousands of clients who trust us to help them build their financial future with confidence and peace of mind.
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <div className="bg-muted p-3 rounded-lg">
                  <CircleDollarSign className="h-6 w-6 text-primary" />
                  <div className="mt-2">
                    <h4 className="font-medium">Smart Investing</h4>
                    <p className="text-xs text-muted-foreground">For everyone</p>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <div className="mt-2">
                    <h4 className="font-medium">Reliable Growth</h4>
                    <p className="text-xs text-muted-foreground">Consistent returns</p>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                  <div className="mt-2">
                    <h4 className="font-medium">Quick Access</h4>
                    <p className="text-xs text-muted-foreground">When you need it</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 md:p-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Our Impact</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Democratizing Investment</p>
                      <p className="text-sm text-muted-foreground">
                        Making financial growth opportunities accessible to everyone, not just the privileged few.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Financial Literacy</p>
                      <p className="text-sm text-muted-foreground">
                        Empowering our users with knowledge and tools to make informed financial decisions.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Life-Responsive Finance</p>
                      <p className="text-sm text-muted-foreground">
                        Creating financial products that adapt to life&apos;s unpredictability, not the other way around.
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="border-t pt-4 mt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary/5 flex justify-center">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to grow with us?</h2>
            <p className="text-muted-foreground text-lg max-w-[700px]">
              Join thousands of satisfied customers who are building their financial future with Savium.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create Your Account
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                window.location.href = "mailto:khalkaraditya8@gmail.com?subject=Inquiry%20about%20Savium%20Investment%20Platform&body=Hello%2C%0A%0AI'm%20interested%20in%20learning%20more%20about%20Savium.%20Please%20contact%20me%20to%20discuss%20your%20investment%20options.%0A%0AThank%20you%2C";
              }}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}