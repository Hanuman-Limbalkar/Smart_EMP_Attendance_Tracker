"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Clock, CalendarDays, Download, Filter, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const attendanceRecords = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "John Doe",
    department: "Engineering",
    date: "2024-01-08",
    checkIn: "09:00:00",
    checkOut: "17:30:00",
    workHours: 8.5,
    status: "Present",
    isLate: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Sarah Wilson",
    department: "Marketing",
    date: "2024-01-08",
    checkIn: "09:15:00",
    checkOut: "17:45:00",
    workHours: 8.5,
    status: "Present",
    isLate: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: "Mike Johnson",
    department: "Sales",
    date: "2024-01-08",
    checkIn: null,
    checkOut: null,
    workHours: 0,
    status: "Absent",
    isLate: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    employeeId: 4,
    employeeName: "Emily Davis",
    department: "HR",
    date: "2024-01-08",
    checkIn: "08:45:00",
    checkOut: "17:15:00",
    workHours: 8.5,
    status: "Present",
    isLate: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    employeeId: 5,
    employeeName: "David Brown",
    department: "Finance",
    date: "2024-01-08",
    checkIn: "09:30:00",
    checkOut: null,
    workHours: 0,
    status: "Partial",
    isLate: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const departments = ["All", "Engineering", "Marketing", "Sales", "HR", "Finance"]
const statusOptions = ["All", "Present", "Absent", "Partial"]

export default function AttendanceTracking() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "All" || record.department === selectedDepartment
    const matchesStatus = selectedStatus === "All" || record.status === selectedStatus
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusIcon = (status, isLate) => {
    if (status === "Present") {
      return isLate ? (
        <AlertCircle className="h-4 w-4 text-orange-500" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-500" />
      )
    } else if (status === "Absent") {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status, isLate) => {
    if (status === "Present") {
      return (
        <Badge
          variant={isLate ? "secondary" : "default"}
          className={isLate ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}
        >
          {isLate ? "Late" : "On Time"}
        </Badge>
      )
    } else if (status === "Absent") {
      return <Badge variant="destructive">Absent</Badge>
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Partial
        </Badge>
      )
    }
  }

  const calculateTotalHours = () => {
    return filteredRecords.reduce((total, record) => total + record.workHours, 0).toFixed(1)
  }

  const getPresentCount = () => {
    return filteredRecords.filter((record) => record.status === "Present").length
  }

  const getAbsentCount = () => {
    return filteredRecords.filter((record) => record.status === "Absent").length
  }

  const getLateCount = () => {
    return filteredRecords.filter((record) => record.isLate && record.status === "Present").length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Attendance Tracking</h2>
          <p className="text-muted-foreground">Monitor daily attendance and work hours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Clock className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{getPresentCount()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{getAbsentCount()}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold text-orange-600">{getLateCount()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{calculateTotalHours()}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setIsCalendarOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} record(s) for {format(selectedDate, "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={record.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {record.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{record.employeeName}</p>
                        <p className="text-sm text-muted-foreground">ID: {record.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(record.status, record.isLate)}
                      <span className="ml-2">{record.checkIn || "Not checked in"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.checkOut || "Not checked out"}</TableCell>
                  <TableCell>
                    <span className="font-medium">{record.workHours}h</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status, record.isLate)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View
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
