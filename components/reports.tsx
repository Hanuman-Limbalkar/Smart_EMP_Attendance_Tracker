"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, FileText, TrendingUp, TrendingDown, CalendarDays, Filter } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts"
import { format, subMonths } from "date-fns"
import { cn } from "@/lib/utils"

const monthlyAttendanceData = [
  { month: "Jan", attendance: 88.5, target: 90, lateArrivals: 12 },
  { month: "Feb", attendance: 92.1, target: 90, lateArrivals: 8 },
  { month: "Mar", attendance: 87.3, target: 90, lateArrivals: 15 },
  { month: "Apr", attendance: 90.8, target: 90, lateArrivals: 10 },
  { month: "May", attendance: 89.2, target: 90, lateArrivals: 11 },
  { month: "Jun", attendance: 91.5, target: 90, lateArrivals: 7 },
]

const departmentPerformance = [
  { department: "Engineering", attendance: 92.5, avgHours: 8.2, productivity: 95 },
  { department: "Marketing", attendance: 88.3, avgHours: 7.8, productivity: 87 },
  { department: "Sales", attendance: 85.7, avgHours: 8.5, productivity: 92 },
  { department: "HR", attendance: 95.2, avgHours: 8.0, productivity: 90 },
  { department: "Finance", attendance: 90.1, avgHours: 8.1, productivity: 88 },
]

const weeklyTrends = [
  { week: "Week 1", present: 125, absent: 10, late: 8, overtime: 15 },
  { week: "Week 2", present: 128, absent: 7, late: 12, overtime: 18 },
  { week: "Week 3", present: 122, absent: 13, late: 15, overtime: 12 },
  { week: "Week 4", present: 130, absent: 5, late: 6, overtime: 20 },
]

const exceptionReports = [
  {
    id: 1,
    type: "Excessive Absences",
    employee: "Mike Johnson",
    department: "Sales",
    details: "5 absences in last 2 weeks",
    severity: "High",
    date: "2024-01-08",
  },
  {
    id: 2,
    type: "Consistent Late Arrivals",
    employee: "Sarah Wilson",
    department: "Marketing",
    details: "Late 8 times this month",
    severity: "Medium",
    date: "2024-01-07",
  },
  {
    id: 3,
    type: "Overtime Threshold",
    employee: "John Doe",
    department: "Engineering",
    details: "45+ hours this week",
    severity: "Medium",
    date: "2024-01-06",
  },
  {
    id: 4,
    type: "No Check-out",
    employee: "Emily Davis",
    department: "HR",
    details: "Forgot to check out yesterday",
    severity: "Low",
    date: "2024-01-05",
  },
]

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date(),
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const getSeverityBadge = (severity) => {
    const variants = {
      High: "destructive",
      Medium: "secondary",
      Low: "outline",
    }
    return <Badge variant={variants[severity]}>{severity}</Badge>
  }

  const calculateAttendanceRate = () => {
    const totalPresent = weeklyTrends.reduce((sum, week) => sum + week.present, 0)
    const totalAbsent = weeklyTrends.reduce((sum, week) => sum + week.absent, 0)
    return ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1)
  }

  const calculateAverageHours = () => {
    return departmentPerformance.reduce((sum, dept) => sum + dept.avgHours, 0) / departmentPerformance.length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive attendance and performance insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-2xl font-bold">{calculateAttendanceRate()}%</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.3% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Work Hours</p>
                <p className="text-2xl font-bold">{calculateAverageHours().toFixed(1)}h</p>
                <div className="flex items-center text-sm text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -0.2h from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold">41</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -15% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Productivity Score</p>
                <p className="text-2xl font-bold">90.4</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +1.8 from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trends</CardTitle>
            <CardDescription>Attendance rate vs target over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attendance: { label: "Attendance %", color: "#3b82f6" },
                target: { label: "Target %", color: "#10b981" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Overview</CardTitle>
            <CardDescription>Present, absent, and late trends by week</CardDescription>
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
                <AreaChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area type="monotone" dataKey="late" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Analysis</CardTitle>
          <CardDescription>Comparative analysis across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead>Avg Work Hours</TableHead>
                <TableHead>Productivity Score</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentPerformance.map((dept) => (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dept.attendance}%` }}></div>
                      </div>
                      {dept.attendance}%
                    </div>
                  </TableCell>
                  <TableCell>{dept.avgHours}h</TableCell>
                  <TableCell>
                    <Badge variant={dept.productivity >= 90 ? "default" : "secondary"}>{dept.productivity}</Badge>
                  </TableCell>
                  <TableCell>
                    {dept.attendance >= 90 && dept.productivity >= 90 ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Excellent
                      </div>
                    ) : dept.attendance >= 85 && dept.productivity >= 85 ? (
                      <div className="flex items-center text-yellow-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Good
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Needs Improvement
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exception Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Exception Reports</CardTitle>
          <CardDescription>Attendance anomalies and issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptionReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.type}</TableCell>
                  <TableCell>{report.employee}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.department}</Badge>
                  </TableCell>
                  <TableCell>{report.details}</TableCell>
                  <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
