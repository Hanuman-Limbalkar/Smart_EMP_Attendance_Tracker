"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, TrendingUp, Building2, BarChart3, Sparkles, Zap, LogOut, User } from "lucide-react"
import Dashboard from "@/components/dashboard"
import EmployeeManagement from "@/components/employee-management"
import AttendanceTracking from "@/components/attendance-tracking"
import Reports from "@/components/reports"
import DepartmentManagement from "@/components/department-management"
import AuthForm from "@/components/auth/login-form"

// Update the GalaxyUser interface to include demo role
interface GalaxyUser {
  id: number
  full_name: string
  email: string
  role: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user, setUser] = useState<GalaxyUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: GalaxyUser) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setActiveTab("dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-purple-300">Loading Galaxy EMS...</p>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <AuthForm onLogin={handleLogin} />
  }

  // Main application for authenticated users
  return (
    <div className="min-h-screen">
      {/* Galaxy Header */}
      <header className="galaxy-card border-b border-purple-500/30 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl glow-purple">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">Galaxy Employee System</h1>
                <p className="text-purple-300 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Advanced Attendance Tracker
                </p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-purple-300">
                <User className="h-5 w-5" />
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.full_name}</p>
                  <p className="text-xs text-purple-400 capitalize">{user.role === "demo" ? "Demo Mode" : user.role}</p>
                </div>
              </div>

              <Badge
                className={`${user.role === "demo" ? "bg-gradient-to-r from-green-600 to-emerald-600" : "galaxy-button"} text-white border-0 px-4 py-2`}
              >
                <div
                  className={`w-2 h-2 ${user.role === "demo" ? "bg-green-400" : "bg-green-400"} rounded-full mr-2 animate-pulse`}
                ></div>
                {user.role === "demo" ? "Demo" : "Online"}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {user.role === "demo" ? "Exit Demo" : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="galaxy-card border border-purple-500/30 p-2 h-auto">
            <TabsTrigger
              value="dashboard"
              className="galaxy-button data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center gap-2 px-6 py-3"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              className="galaxy-button data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center gap-2 px-6 py-3"
            >
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="galaxy-button data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center gap-2 px-6 py-3"
            >
              <Clock className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="galaxy-button data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center gap-2 px-6 py-3"
            >
              <Building2 className="h-4 w-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="galaxy-button data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center gap-2 px-6 py-3"
            >
              <TrendingUp className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceTracking />
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Reports />
          </TabsContent>
        </Tabs>
      </main>

      {/* Galaxy Footer */}
      <footer className="mt-20 border-t border-purple-500/30 galaxy-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-purple-300 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Powered by Galaxy Technology - Welcome, {user.full_name}!
              <Sparkles className="h-4 w-4" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
