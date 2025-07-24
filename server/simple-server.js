const express = require("express")
const cors = require("cors")

const app = express()
const PORT = 5000

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Parse JSON bodies
app.use(express.json())

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  console.log("Headers:", req.headers)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", req.body)
  }
  next()
})

// Root endpoint
app.get("/", (req, res) => {
  console.log("Root endpoint hit")
  res.json({
    message: "Employee Management Server is running!",
    timestamp: new Date().toISOString(),
    status: "OK",
  })
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  console.log("Health check endpoint hit")
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  })
})

// Login endpoint - EXACTLY what the frontend expects
app.post("/api/auth/login", (req, res) => {
  console.log("Login endpoint hit")
  console.log("Request body:", req.body)

  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    console.log("Missing email or password")
    return res.status(400).json({
      error: "Email and password are required",
    })
  }

  // Test credentials
  if (email === "admin@company.com" && password === "admin123") {
    console.log("Login successful for admin")
    const response = {
      message: "Login successful",
      token: "test-jwt-token-12345",
      user: {
        id: 1,
        full_name: "System Administrator",
        email: "admin@company.com",
        role: "admin",
      },
    }
    console.log("Sending response:", response)
    return res.json(response)
  } else {
    console.log("Invalid credentials")
    return res.status(401).json({
      error: "Invalid email or password",
    })
  }
})

// Signup endpoint
app.post("/api/auth/signup", (req, res) => {
  console.log("Signup endpoint hit")
  console.log("Request body:", req.body)

  const { full_name, email, password } = req.body

  if (!full_name || !email || !password) {
    return res.status(400).json({
      error: "Full name, email, and password are required",
    })
  }

  console.log("Signup successful")
  const response = {
    message: "User created successfully",
    user: {
      id: Date.now(),
      full_name,
      email,
      role: "employee",
    },
  }
  console.log("Sending response:", response)
  res.status(201).json(response)
})

// Mock other endpoints the frontend might call
app.get("/api/employees", (req, res) => {
  console.log("Employees endpoint hit")
  res.json({
    employees: [],
    total: 0,
    page: 1,
    totalPages: 0,
  })
})

app.get("/api/dashboard/stats", (req, res) => {
  console.log("Dashboard stats endpoint hit")
  res.json({
    totalEmployees: 0,
    todayAttendance: {
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      total_records: 0,
    },
  })
})

app.get("/api/departments", (req, res) => {
  console.log("Departments endpoint hit")
  res.json([])
})

// Catch all other routes and return JSON (not HTML)
app.use("*", (req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error: "Endpoint not found",
    method: req.method,
    path: req.originalUrl,
    available_endpoints: ["GET /", "GET /api/health", "POST /api/auth/login", "POST /api/auth/signup"],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Simple Test Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`Test login: admin@company.com / admin123`)
  console.log(`Ready to test authentication!`)
})

// Handle process termination
process.on("SIGINT", () => {
  console.log("\nServer shutting down...")
  process.exit(0)
})
