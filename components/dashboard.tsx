"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Clock, Calendar, AlertTriangle, Rocket } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

// Define types for better TypeScript support
interface AttendanceData {
  day: string
  present: number
  absent: number
  late: number
}

interface DepartmentData {
  name: string
  employees: number
  color: string
}

interface MonthlyTrend {
  month: string
  attendance: number
  productivity: number
}

interface WorkHoursData {
  time: string
  hours: number
}

interface DashboardStats {
  totalEmployees: number
  todayAttendance: {
    present_count: number
    absent_count: number
    late_count: number
    total_records: number
  }
  weeklyTrend: AttendanceData[]
  departmentStats: DepartmentData[]
}

const attendanceData: AttendanceData[] = [
  { day: "Mon", present: 85, absent: 15, late: 8 },
  { day: "Tue", present: 92, absent: 8, late: 5 },
  { day: "Wed", present: 88, absent: 12, late: 12 },
  { day: "Thu", present: 90, absent: 10, late: 7 },
  { day: "Fri", present: 87, absent: 13, late: 10 },
  { day: "Sat", present: 45, absent: 55, late: 3 },
  { day: "Sun", present: 20, absent: 80, late: 1 },
]

const departmentData: DepartmentData[] = [
  { name: "Engineering", employees: 45, color: "#3b82f6" },
  { name: "Marketing", employees: 25, color: "#10b981" },
  { name: "Sales", employees: 30, color: "#f59e0b" },
  { name: "HR", employees: 15, color: "#ef4444" },
  { name: "Finance", employees: 20, color: "#8b5cf6" },
]

const monthlyTrend: MonthlyTrend[] = [
  { month: "Jan", attendance: 88, productivity: 85 },
  { month: "Feb", attendance: 92, productivity: 89 },
  { month: "Mar", attendance: 87, productivity: 84 },
  { month: "Apr", attendance: 90, productivity: 88 },
  { month: "May", attendance: 89, productivity: 87 },
  { month: "Jun", attendance: 91, productivity: 90 },
]

const workHoursData: WorkHoursData[] = [
  { time: "9:00", hours: 8.2 },
  { time: "10:00", hours: 8.5 },
  { time: "11:00", hours: 8.8 },
  { time: "12:00", hours: 8.3 },
  { time: "13:00", hours: 7.9 },
  { time: "14:00", hours: 8.1 },
  { time: "15:00", hours: 8.4 },
]

export default function Dashboard(): JSX.Element {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  useEffect(() => {
    // Check if user is in demo mode
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setIsDemoMode(user.role === "demo")
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    const fetchDashboardData = async (): Promise<void> => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard/stats")
        const data: DashboardStats = await response.json()
        setDashboardStats(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="galaxy-card glow-green rounded-xl p-4 border border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="flex items-center justify-center gap-3">
            <Rocket className="h-5 w-5 text-green-400" />
            <div className="text-center">
              <p className="text-green-300 font-semibold">Demo Mode Active</p>
              <p className="text-green-400 text-sm">
              All features are available!
              </p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="galaxy-card glow-purple rounded-xl p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-purple-300">Total Employees</h3>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gradient">{dashboardStats?.totalEmployees || 135}</div>
          <p className="text-xs text-purple-300">
            <span className="text-green-400">+5</span> from last month
          </p>
        </div>

        <div className="galaxy-card glow-blue rounded-xl p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-blue-300">Present Today</h3>
            <UserCheck className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">
            {dashboardStats?.todayAttendance?.present_count || 122}
          </div>
          <p className="text-xs text-blue-300">90.4% attendance rate</p>
        </div>

        <div className="galaxy-card glow-pink rounded-xl p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-pink-300">Absent Today</h3>
            <UserX className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{dashboardStats?.todayAttendance?.absent_count || 13}</div>
          <p className="text-xs text-pink-300">9.6% absence rate</p>
        </div>

        <div className="galaxy-card glow-purple rounded-xl p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-orange-300">Late Arrivals</h3>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400">{dashboardStats?.todayAttendance?.late_count || 8}</div>
          <p className="text-xs text-orange-300">6.6% of present employees</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Overview</CardTitle>
            <CardDescription>Daily attendance, absence, and late arrival trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                present: { label: "Present", color: "#10b981" },
                absent: { label: "Absent", color: "#ef4444" },
                late: { label: "Late", color: "#f59e0b" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="present" fill="#10b981" />
                  <Bar dataKey="absent" fill="#ef4444" />
                  <Bar dataKey="late" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employee count by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                employees: { label: "Employees" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="employees"
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
            <CardDescription>Attendance and productivity correlation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attendance: { label: "Attendance %", color: "#3b82f6" },
                productivity: { label: "Productivity %", color: "#10b981" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="productivity" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Work Hours</CardTitle>
            <CardDescription>Daily work hours distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                hours: { label: "Hours", color: "#8b5cf6" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={workHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest employee activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">John Doe checked in</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sarah Wilson arrived late</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New employee added to Engineering</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Mike Johnson marked absent</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">High Absence Rate</p>
                <p className="text-xs text-red-600">Marketing department has 20% absence today</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Late Arrivals Spike</p>
                <p className="text-xs text-orange-600">15% increase in late arrivals this week</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Monthly Report Due</p>
                <p className="text-xs text-blue-600">Generate attendance report by end of week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
