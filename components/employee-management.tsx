"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Mail, Phone, Calendar, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data for departments and roles (you can fetch these from API later)
const departments = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Marketing" },
  { id: 3, name: "Sales" },
  { id: 4, name: "HR" },
  { id: 5, name: "Finance" },
]

const roles = [
  { id: 1, name: "Senior Developer", department_id: 1 },
  { id: 2, name: "Junior Developer", department_id: 1 },
  { id: 6, name: "Marketing Manager", department_id: 2 },
  { id: 7, name: "Content Creator", department_id: 2 },
  { id: 11, name: "Sales Manager", department_id: 3 },
  { id: 12, name: "Sales Representative", department_id: 3 },
  { id: 15, name: "HR Manager", department_id: 4 },
  { id: 16, name: "HR Specialist", department_id: 4 },
  { id: 19, name: "Financial Manager", department_id: 5 },
  { id: 20, name: "Accountant", department_id: 5 },
]

export default function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [searchTerm, selectedDepartment])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        department: selectedDepartment,
      })

      const response = await fetch(`http://localhost:5000/api/employees?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setEmployees(data.employees || [])
      setError("")
    } catch (error) {
      console.error("Error fetching employees:", error)
      setError("Failed to fetch employees. Please check if the backend server is running.")
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (employeeData) => {
    try {
      console.log("Sending employee data:", employeeData) // Debug log

      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Employee created successfully:", result)

      fetchEmployees() // Refresh the list
      setIsAddDialogOpen(false)
      setError("")
    } catch (error) {
      console.error("Error adding employee:", error)
      setError(`Failed to add employee: ${error.message}`)
    }
  }

  const handleUpdateEmployee = async (employeeData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${selectedEmployee.employee_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      fetchEmployees() // Refresh the list
      setIsEditDialogOpen(false)
      setSelectedEmployee(null)
      setError("")
    } catch (error) {
      console.error("Error updating employee:", error)
      setError(`Failed to update employee: ${error.message}`)
    }
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      fetchEmployees() // Refresh the list
      setError("")
    } catch (error) {
      console.error("Error deleting employee:", error)
      setError(`Failed to delete employee: ${error.message}`)
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || employee.department_name === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const handleEdit = (employee) => {
    setSelectedEmployee(employee)
    setIsEditDialogOpen(true)
  }

  const EmployeeForm = ({ employee = null, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      employee_name: employee?.employee_name || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      department_id: employee?.department_id || "",
      role_id: employee?.role_id || "",
      hire_date: employee?.hire_date ? employee.hire_date.split("T")[0] : "",
      salary: employee?.salary || "",
      status: employee?.status || "Active",
    })

    const [selectedDepartmentId, setSelectedDepartmentId] = useState(employee?.department_id || "")
    const [availableRoles, setAvailableRoles] = useState([])

    // Filter roles based on selected department
    useEffect(() => {
      if (selectedDepartmentId) {
        const departmentRoles = roles.filter((role) => role.department_id === Number.parseInt(selectedDepartmentId))
        setAvailableRoles(departmentRoles)
      } else {
        setAvailableRoles([])
      }
    }, [selectedDepartmentId])

    const handleDepartmentChange = (departmentId) => {
      setSelectedDepartmentId(departmentId)
      setFormData({
        ...formData,
        department_id: Number.parseInt(departmentId),
        role_id: "", // Reset role when department changes
      })
    }

    const handleSubmit = (e) => {
      e.preventDefault()

      // Validate required fields
      if (!formData.employee_name.trim()) {
        setError("Employee name is required")
        return
      }
      if (!formData.email.trim()) {
        setError("Email is required")
        return
      }
      if (!formData.hire_date) {
        setError("Hire date is required")
        return
      }

      console.log("Form data being submitted:", formData) // Debug log
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employee_name">Full Name *</Label>
            <Input
              id="employee_name"
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              required
              placeholder="Enter full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="hire_date">Hire Date *</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={selectedDepartmentId.toString()} onValueChange={handleDepartmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role_id.toString()}
              onValueChange={(value) => setFormData({ ...formData, role_id: Number.parseInt(value) })}
              disabled={!selectedDepartmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number.parseFloat(e.target.value) || "" })}
              placeholder="Enter salary"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{employee ? "Update Employee" : "Add Employee"}</Button>
        </DialogFooter>
      </form>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading employees...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Employee Management</h2>
          <p className="text-purple-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Manage employee information and profiles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="galaxy-button text-white border-0 px-6 py-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Enter the employee details to add them to the system.</DialogDescription>
            </DialogHeader>
            <EmployeeForm
              onClose={() => {
                setIsAddDialogOpen(false)
                setError("")
              }}
              onSubmit={handleAddEmployee}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Filters */}
      <div className="galaxy-card rounded-xl p-6 glow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gradient">Filters</h3>
        </div>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>{filteredEmployees.length} employee(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No employees found. Try adjusting your search or add a new employee.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {employee.employee_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.employee_name}</p>
                          <p className="text-sm text-muted-foreground">ID: {employee.employee_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department_name || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>{employee.role_name || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.status === "Active" ? "default" : "secondary"}>{employee.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEmployee(employee.employee_id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee information.</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeForm
              employee={selectedEmployee}
              onClose={() => {
                setIsEditDialogOpen(false)
                setSelectedEmployee(null)
                setError("")
              }}
              onSubmit={handleUpdateEmployee}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
