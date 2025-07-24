"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Sparkles, Zap, Shield, Mail, Lock, User, Rocket, ArrowRight } from "lucide-react"

interface AuthFormProps {
  onLogin: (userData: any) => void
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("🔄 Attempting login with:", {
        email: loginData.email,
        method: "POST",
        url: "http://localhost:5000/api/auth/login",
      })

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST", // Explicitly set POST method
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", response.headers.get("content-type"))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("❌ Non-JSON response:", textResponse)
        throw new Error("Server returned non-JSON response. Check server logs.")
      }

      const data = await response.json()
      console.log("📦 Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setSuccess("Login successful! Welcome back!")
      setTimeout(() => {
        onLogin(data.user)
      }, 1000)
    } catch (error: any) {
      console.error("❌ Login error:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError("Cannot connect to server. Please ensure the backend server is running on http://localhost:5000")
      } else {
        setError(error.message || "Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      console.log("🔄 Attempting signup with:", {
        full_name: signupData.full_name,
        email: signupData.email,
      })

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST", // Explicitly set POST method
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          full_name: signupData.full_name,
          email: signupData.email,
          password: signupData.password,
          role: signupData.role,
        }),
      })

      // Check if response is HTML (server not running or wrong endpoint)
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server is not responding correctly. Please check if the backend server is running on port 5000.",
        )
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      setSuccess("Account created successfully! Please login.")
      setSignupData({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "employee",
      })
    } catch (error: any) {
      console.error("❌ Signup error:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError("Cannot connect to server. Please ensure the backend server is running on http://localhost:5000")
      } else if (error.message.includes("<!DOCTYPE")) {
        setError("Server error: Received HTML instead of JSON. Check if the backend server is running correctly.")
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setLoginData({
      email: "admin@company.com",
      password: "admin123",
    })
    setError("")
  }

  // Skip login and go directly to dashboard
  const handleSkipLogin = () => {
    const guestUser = {
      id: 0,
      full_name: "Guest User",
      email: "guest@demo.com",
      role: "demo",
    }

    // Store guest user data
    localStorage.setItem("token", "demo-token")
    localStorage.setItem("user", JSON.stringify(guestUser))

    setSuccess("Entering demo mode...")
    setTimeout(() => {
      onLogin(guestUser)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Card className="w-full max-w-md galaxy-card glow-purple relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl glow-purple">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gradient"> Employee Management System</CardTitle>
            <CardDescription className="text-purple-300 flex items-center justify-center gap-2 mt-2">
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Quick Access Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleSkipLogin}
              className="w-full galaxy-button text-white border-0 py-4 text-lg font-semibold"
              disabled={loading}
            >
              <Rocket className="h-5 w-5 mr-3" />
              Enter Demo Mode
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-500/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-purple-400">Or sign in with account</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 galaxy-card border border-purple-500/30">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-purple-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10 galaxy-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-purple-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10 pr-10 galaxy-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full galaxy-button text-white border-0 py-3" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                  onClick={handleDemoLogin}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Fill Demo Credentials
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-purple-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.full_name}
                      onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                      className="pl-10 galaxy-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-purple-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10 galaxy-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-purple-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10 pr-10 galaxy-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-purple-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="pl-10 galaxy-input"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full galaxy-button text-white border-0 py-3" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Create Account
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
