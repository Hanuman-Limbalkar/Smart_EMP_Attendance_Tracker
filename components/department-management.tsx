"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Users, Building2, UserCheck, Clock } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Define interfaces for type safety
interface Department {
  id: number
  name: string
  description: string
  manager: string
  employeeCount: number
  budget: number
  location: string
  avgAttendance: number
  createdDate: string
}

interface Role {
  department: string
  role: string
  count: number
}

interface DepartmentFormData {
  name: string
  description: string
  manager: string
  budget: string
  location: string
}

const departments: Department[] = [
  {
    id: 1,
    name: "Engineering",
    description: "Software development and technical operations",
    manager: "John Smith",
    employeeCount: 45,
    budget: 2500000,
    location: "Building A, Floor 3",
    avgAttendance: 92,
    createdDate: "2020-01-15",
  },
  {
    id: 2,
    name: "Marketing",
    description: "Brand management and customer acquisition",
    manager: "Sarah Johnson",
    employeeCount: 25,
    budget: 1200000,
    location: "Building B, Floor 2",
    avgAttendance: 88,
    createdDate: "2020-02-20",
  },
  {
    id: 3,
    name: "Sales",
    description: "Revenue generation and client relationships",
    manager: "Mike Wilson",
    employeeCount: 30,
    budget: 1800000,
    location: "Building A, Floor 1",
    avgAttendance: 85,
    createdDate: "2020-01-10",
  },
  {
    id: 4,
    name: "HR",
    description: "Human resources and employee relations",
    manager: "Emily Davis",
    employeeCount: 15,
    budget: 800000,
    location: "Building B, Floor 1",
    avgAttendance: 95,
    createdDate: "2020-01-05",
  },
  {
    id: 5,
    name: "Finance",
    description: "Financial planning and accounting",
    manager: "David Brown",
    employeeCount: 20,
    budget: 1000000,
    location: "Building A, Floor 2",
    avgAttendance: 90,
    createdDate: "2020-01-08",
  },
]

const roles: Role[] = [
  { department: "Engineering", role: "Senior Developer", count: 15 },
  { department: "Engineering", role: "Junior Developer", count: 20 },
  { department: "Engineering", role: "Tech Lead", count: 8 },
  { department: "Engineering", role: "DevOps Engineer", count: 2 },
  { department: "Marketing", role: "Marketing Manager", count: 5 },
  { department: "Marketing", role: "Content Creator", count: 10 },
  { department: "Marketing", role: "SEO Specialist", count: 6 },
  { department: "Marketing", role: "Social Media Manager", count: 4 },
  { department: "Sales", role: "Sales Manager", count: 5 },
  { department: "Sales", role: "Sales Representative", count: 20 },
  { department: "Sales", role: "Account Executive", count: 5 },
  { department: "HR", role: "HR Manager", count: 3 },
  { department: "HR", role: "HR Specialist", count: 8 },
  { department: "HR", role: "Recruiter", count: 4 },
  { department: "Finance", role: "Financial Manager", count: 3 },
  { department: "Finance", role: "Accountant", count: 12 },
  { department: "Finance", role: "Financial Analyst", count: 5 },
]

const departmentColors: Record<string, string> = {
  Engineering: "#3b82f6",
  Marketing: "#10b981",
  Sales: "#f59e0b",
  HR: "#ef4444",
  Finance: "#8b5cf6",
}

// Department Form Component
interface DepartmentFormProps {
  department?: Department | null
  onClose: () => void
}

function DepartmentForm({ department = null, onClose }: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: department?.name || "",
    description: department?.description || "",
    manager: department?.manager || "",
    budget: department?.budget?.toString() || "",
    location: department?.location || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Department Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manager">Department Manager</Label>
          <Input
            id="manager"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="budget">Annual Budget ($)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{department ? "Update Department" : "Add Department"}</Button>
      </DialogFooter>
    </form>
  )
}

export default function DepartmentManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department)
    setIsEditDialogOpen(true)
  }

  const chartData = departments.map((dept) => ({
    name: dept.name,
    employees: dept.employeeCount,
    attendance: dept.avgAttendance,
    fill: departmentColors[dept.name],
  }))

  const pieData = departments.map((dept) => ({
    name: dept.name,
    value: dept.employeeCount,
    fill: departmentColors[dept.name],
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Department Management</h2>
          <p className="text-muted-foreground">Manage departments, roles, and organizational structure</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>Create a new department in your organization.</DialogDescription>
            </DialogHeader>
            <DepartmentForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold">
                  {Math.round(departments.reduce((sum, dept) => sum + dept.avgAttendance, 0) / departments.length)}%
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  ${(departments.reduce((sum, dept) => sum + dept.budget, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Employee Count</CardTitle>
            <CardDescription>Number of employees per department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                employees: { label: "Employees", color: "#3b82f6" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="employees" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution</CardTitle>
            <CardDescription>Percentage distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Employees" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department List */}
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>Detailed information about each department</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{department.name}</p>
                      <p className="text-sm text-muted-foreground">{department.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{department.manager}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {department.employeeCount}
                    </div>
                  </TableCell>
                  <TableCell>${(department.budget / 1000000).toFixed(1)}M</TableCell>
                  <TableCell>{department.location}</TableCell>
                  <TableCell>
                    <Badge variant={department.avgAttendance >= 90 ? "default" : "secondary"}>
                      {department.avgAttendance}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(department)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Roles by Department */}
      <Card>
        <CardHeader>
          <CardTitle>Roles by Department</CardTitle>
          <CardDescription>Breakdown of roles within each department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((department) => (
              <Card
                key={department.id}
                className="border-l-4"
                style={{ borderLeftColor: departmentColors[department.name] }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {roles
                    .filter((role) => role.department === department.name)
                    .map((role, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{role.role}</span>
                        <Badge variant="outline">{role.count}</Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update the department information.</DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <DepartmentForm
              department={selectedDepartment}
              onClose={() => {
                setIsEditDialogOpen(false)
                setSelectedDepartment(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
