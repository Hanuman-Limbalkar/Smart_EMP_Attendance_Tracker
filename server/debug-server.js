const express = require("express")
const cors = require("cors")

const app = express()
const PORT = 5000

// Enable CORS first
app.use(
  cors({
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

// Handle preflight requests
app.options("*", (req, res) => {
  console.log("📋 OPTIONS request received for:", req.path)
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.sendStatus(200)
})

// Parse JSON bodies
app.use(express.json())

// Log all requests
app.use((req, res, next) => {
  console.log(`\n🔍 ${new Date().toISOString()}`)
  console.log(`📍 ${req.method} ${req.url}`)
  console.log(`🌐 Origin: ${req.headers.origin || "none"}`)
  console.log(`📦 Content-Type: ${req.headers["content-type"] || "none"}`)
  console.log(`📝 User-Agent: ${req.headers["user-agent"] || "none"}`)

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📄 Body:`, req.body)
  }

  next()
})

// Root endpoint
app.get("/", (req, res) => {
  console.log("✅ Root endpoint hit")
  res.json({
    message: "🚀 Debug Server is running!",
    timestamp: new Date().toISOString(),
    status: "OK",
  })
})

// Health check
app.get("/api/health", (req, res) => {
  console.log("✅ Health endpoint hit")
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    port: PORT,
  })
})

// Login endpoint with detailed logging
app.post("/api/auth/login", (req, res) => {
  console.log("🔐 Login endpoint hit!")
  console.log("📦 Request body:", req.body)
  console.log("📋 Request headers:", req.headers)

  try {
    const { email, password } = req.body

    if (!email || !password) {
      console.log("❌ Missing credentials")
      return res.status(400).json({
        error: "Email and password are required",
      })
    }

    if (email === "admin@company.com" && password === "admin123") {
      console.log("✅ Login successful!")
      const response = {
        message: "Login successful",
        token: "debug-token-123",
        user: {
          id: 1,
          full_name: "Debug Admin",
          email: "admin@company.com",
          role: "admin",
        },
      }
      console.log("📤 Sending response:", response)
      return res.json(response)
    } else {
      console.log("❌ Invalid credentials")
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }
  } catch (error) {
    console.error("💥 Login error:", error)
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  }
})

// Create Employee endpoint
app.post("/api/employees", (req, res) => {
  console.log("📍 Create Employee endpoint hit!")
  console.log("📦 Request body:", req.body)

  try {
    const { employee_name, email, phone, department_id, role_id, hire_date, salary, status = "Active" } = req.body

    // Validate required fields
    if (!employee_name || !email || !hire_date) {
      console.log("❌ Missing required fields")
      return res.status(400).json({
        error: "Missing required fields: employee_name, email, hire_date",
      })
    }

    // Simulate successful employee creation
    const newEmployee = {
      employee_id: Date.now(), // Use timestamp as ID
      employee_name: employee_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      department_id: department_id || null,
      role_id: role_id || null,
      hire_date,
      salary: salary || null,
      status,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      department_name: getDepartmentName(department_id),
      role_name: getRoleName(role_id),
    }

    console.log("✅ Employee created successfully:", newEmployee)
    res.status(201).json(newEmployee)
  } catch (error) {
    console.error("❌ Error creating employee:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  }
})

// Update Employee endpoint
app.put("/api/employees/:id", (req, res) => {
  console.log("📍 Update Employee endpoint hit!")
  console.log("📦 Employee ID:", req.params.id)
  console.log("📦 Request body:", req.body)

  try {
    const employeeId = req.params.id
    const { employee_name, email, phone, department_id, role_id, hire_date, salary, status } = req.body

    // Validate required fields
    if (!employee_name || !email || !hire_date) {
      return res.status(400).json({
        error: "Missing required fields: employee_name, email, hire_date",
      })
    }

    // Simulate successful employee update
    const updatedEmployee = {
      employee_id: Number.parseInt(employeeId),
      employee_name: employee_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      department_id: department_id || null,
      role_id: role_id || null,
      hire_date,
      salary: salary || null,
      status,
      updated_date: new Date().toISOString(),
      department_name: getDepartmentName(department_id),
      role_name: getRoleName(role_id),
    }

    console.log("✅ Employee updated successfully:", updatedEmployee)
    res.json(updatedEmployee)
  } catch (error) {
    console.error("❌ Error updating employee:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  }
})

// Delete Employee endpoint
app.delete("/api/employees/:id", (req, res) => {
  console.log("📍 Delete Employee endpoint hit!")
  console.log("📦 Employee ID:", req.params.id)

  try {
    const employeeId = req.params.id
    console.log("✅ Employee deleted successfully:", employeeId)
    res.json({ message: "Employee deleted successfully", employee_id: employeeId })
  } catch (error) {
    console.error("❌ Error deleting employee:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  }
})

// Helper functions for mock data
function getDepartmentName(departmentId) {
  const departments = {
    1: "Engineering",
    2: "Marketing",
    3: "Sales",
    4: "HR",
    5: "Finance",
  }
  return departments[departmentId] || "Unknown"
}

function getRoleName(roleId) {
  const roles = {
    1: "Senior Developer",
    2: "Junior Developer",
    6: "Marketing Manager",
    7: "Content Creator",
    11: "Sales Manager",
    12: "Sales Representative",
    15: "HR Manager",
    16: "HR Specialist",
    19: "Financial Manager",
    20: "Accountant",
  }
  return roles[roleId] || "Unknown"
}

// Get Roles endpoint (needed for employee form)
app.get("/api/roles", (req, res) => {
  console.log("📍 Roles endpoint hit")

  const mockRoles = [
    { role_id: 1, role_name: "Senior Developer", department_id: 1, department_name: "Engineering" },
    { role_id: 2, role_name: "Junior Developer", department_id: 1, department_name: "Engineering" },
    { role_id: 6, role_name: "Marketing Manager", department_id: 2, department_name: "Marketing" },
    { role_id: 7, role_name: "Content Creator", department_id: 2, department_name: "Marketing" },
    { role_id: 11, role_name: "Sales Manager", department_id: 3, department_name: "Sales" },
    { role_id: 12, role_name: "Sales Representative", department_id: 3, department_name: "Sales" },
    { role_id: 15, role_name: "HR Manager", department_id: 4, department_name: "HR" },
    { role_id: 16, role_name: "HR Specialist", department_id: 4, department_name: "HR" },
    { role_id: 19, role_name: "Financial Manager", department_id: 5, department_name: "Finance" },
    { role_id: 20, role_name: "Accountant", department_id: 5, department_name: "Finance" },
  ]

  const { department_id } = req.query
  let filteredRoles = mockRoles

  if (department_id) {
    filteredRoles = mockRoles.filter((role) => role.department_id === Number.parseInt(department_id))
  }

  console.log("✅ Returning roles:", filteredRoles.length)
  res.json(filteredRoles)
})

// Update the employees endpoint to return more realistic data
app.get("/api/employees", (req, res) => {
  console.log("📍 Employees endpoint hit")

  const mockEmployees = [
    {
      employee_id: 1,
      employee_name: "John Doe",
      email: "john.doe@company.com",
      phone: "+1-555-123-4567",
      department_name: "Engineering",
      role_name: "Senior Developer",
      department_id: 1,
      role_id: 1,
      hire_date: "2022-01-15",
      salary: 95000,
      status: "Active",
    },
    {
      employee_id: 2,
      employee_name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      phone: "+1-555-678-9012",
      department_name: "Marketing",
      role_name: "Marketing Manager",
      department_id: 2,
      role_id: 6,
      hire_date: "2021-08-20",
      salary: 80000,
      status: "Active",
    },
    {
      employee_id: 3,
      employee_name: "Mike Johnson",
      email: "mike.johnson@company.com",
      phone: "+1-555-234-5678",
      department_name: "Sales",
      role_name: "Sales Manager",
      department_id: 3,
      role_id: 11,
      hire_date: "2023-03-10",
      salary: 85000,
      status: "Active",
    },
  ]

  res.json({
    employees: mockEmployees,
    total: mockEmployees.length,
    page: 1,
    totalPages: 1,
  })
})

// Update departments endpoint to return proper structure
app.get("/api/departments", (req, res) => {
  console.log("📍 Departments endpoint hit")

  const mockDepartments = [
    { department_id: 1, department_name: "Engineering", employee_count: 5 },
    { department_id: 2, department_name: "Marketing", employee_count: 3 },
    { department_id: 3, department_name: "Sales", employee_count: 4 },
    { department_id: 4, department_name: "HR", employee_count: 2 },
    { department_id: 5, department_name: "Finance", employee_count: 3 },
  ]

  res.json(mockDepartments)
})

// Catch all other routes
app.use("*", (req, res) => {
  console.log(`❓ Unknown route: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
    available: ["GET /", "GET /api/health", "POST /api/auth/login"],
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err)
  res.status(500).json({
    error: "Server error",
    message: err.message,
  })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 DEBUG SERVER RUNNING`)
  console.log(`📍 URL: http://localhost:${PORT}`)
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`)
  console.log(`\n⏳ Waiting for requests...\n`)
})

// Handle server errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use!`)
    console.log(`💡 Try: lsof -ti:${PORT} | xargs kill -9`)
    process.exit(1)
  } else {
    console.error("❌ Server error:", err)
  }
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down debug server...")
  server.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})
