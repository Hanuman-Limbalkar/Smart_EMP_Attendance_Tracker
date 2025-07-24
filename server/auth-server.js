const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Pool } = require("pg")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// JWT Secret (in production, use a strong secret from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
})

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
)
app.use(express.json())

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect()
    console.log("✅ Connected to PostgreSQL database")

    // Check if auth tables exist
    const authTablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_sessions')
      ORDER BY table_name
    `)

    console.log(
      "🔐 Auth tables:",
      authTablesCheck.rows.map((row) => row.table_name),
    )

    client.release()
  } catch (err) {
    console.error("❌ Database connection failed:", err.message)
  }
}

testConnection()

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Get user from database
    const client = await pool.connect()
    const userResult = await client.query(
      "SELECT user_id, full_name, email, role, is_active FROM users WHERE user_id = $1 AND is_active = true",
      [decoded.userId],
    )
    client.release()

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.user = userResult.rows[0]
    next()
  } catch (error) {
    console.error("Token verification failed:", error)
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT NOW() as time")
    client.release()

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "Connected",
      db_time: result.rows[0].time,
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "Disconnected",
      error: error.message,
    })
  }
})

// Sign up endpoint
app.post("/api/auth/signup", async (req, res) => {
  const client = await pool.connect()

  try {
    const { full_name, email, password, role = "employee" } = req.body

    // Validate input
    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: "Full name, email, and password are required",
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      })
    }

    // Check if user already exists
    const existingUser = await client.query("SELECT user_id FROM users WHERE email = $1", [email.toLowerCase()])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const insertQuery = `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, full_name, email, role, created_at
    `

    const result = await client.query(insertQuery, [full_name.trim(), email.toLowerCase().trim(), passwordHash, role])

    const newUser = result.rows[0]

    console.log("✅ New user created:", { id: newUser.user_id, email: newUser.email, role: newUser.role })

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("❌ Signup error:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  } finally {
    client.release()
  }
})

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const client = await pool.connect()

  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Get user from database
    const userQuery = `
      SELECT user_id, full_name, email, password_hash, role, is_active
      FROM users 
      WHERE email = $1
    `

    const userResult = await client.query(userQuery, [email.toLowerCase().trim()])

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const user = userResult.rows[0]

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Update last login
    await client.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1", [user.user_id])

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }, // Token expires in 24 hours
    )

    console.log("✅ User logged in:", { id: user.user_id, email: user.email, role: user.role })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  } finally {
    client.release()
  }
})

// Get current user profile (protected route)
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user.user_id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role,
    },
  })
})

// Logout endpoint (optional - mainly for clearing server-side sessions)
app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  // In a more complex setup, you might want to blacklist the token
  // For now, we'll just return success (client should remove token)
  res.json({ message: "Logged out successfully" })
})

// Protected route example - Get all users (admin only)
app.get("/api/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }

  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT user_id, full_name, email, role, is_active, created_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `)

    res.json({ users: result.rows })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    client.release()
  }
})

// Update existing endpoints to require authentication
// Get Employees (protected)
app.get("/api/employees", authenticateToken, async (req, res) => {
  const client = await pool.connect()
  try {
    const { department, search, page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        e.employee_id,
        e.employee_name,
        e.email,
        e.phone,
        e.hire_date,
        e.salary,
        e.status,
        d.department_name,
        r.role_name,
        d.department_id,
        r.role_id
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN roles r ON e.role_id = r.role_id
      WHERE 1=1
    `

    const params = []
    let paramCount = 0

    if (department && department !== "all") {
      paramCount++
      query += ` AND d.department_name = $${paramCount}`
      params.push(department)
    }

    if (search && search.trim() !== "") {
      paramCount++
      query += ` AND (e.employee_name ILIKE $${paramCount} OR e.email ILIKE $${paramCount})`
      params.push(`%${search.trim()}%`)
    }

    query += ` ORDER BY e.employee_name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await client.query(query, params)

    res.json({
      employees: result.rows,
      total: result.rows.length,
      page: Number.parseInt(page),
      totalPages: Math.ceil(result.rows.length / limit),
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    client.release()
  }
})

// Create Employee (protected - admin/hr only)
app.post("/api/employees", authenticateToken, async (req, res) => {
  if (!["admin", "hr"].includes(req.user.role)) {
    return res.status(403).json({ error: "Admin or HR access required" })
  }

  const client = await pool.connect()
  try {
    const { employee_name, email, phone, department_id, role_id, hire_date, salary, status = "Active" } = req.body

    // Validate required fields
    if (!employee_name || !email || !hire_date) {
      return res.status(400).json({
        error: "Missing required fields: employee_name, email, hire_date",
      })
    }

    const query = `
      INSERT INTO employees (
        employee_name, email, phone, department_id, role_id, hire_date, salary, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const values = [
      employee_name.trim(),
      email.trim().toLowerCase(),
      phone || null,
      department_id || null,
      role_id || null,
      hire_date,
      salary || null,
      status,
    ]

    const result = await client.query(query, values)
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating employee:", error)
    if (error.code === "23505") {
      res.status(400).json({ error: "Email already exists" })
    } else {
      res.status(500).json({ error: "Internal server error" })
    }
  } finally {
    client.release()
  }
})

// Dashboard stats (protected)
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  const client = await pool.connect()
  try {
    const totalEmployeesQuery = `SELECT COUNT(*) as total_employees FROM employees WHERE status = 'Active'`
    const result = await client.query(totalEmployeesQuery)

    res.json({
      totalEmployees: Number.parseInt(result.rows[0].total_employees),
      todayAttendance: {
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        total_records: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    client.release()
  }
})

// Get Departments (protected)
app.get("/api/departments", authenticateToken, async (req, res) => {
  const client = await pool.connect()
  try {
    const query = `
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(e.employee_id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.status = 'Active'
      WHERE d.is_active = true
      GROUP BY d.department_id, d.department_name
      ORDER BY d.department_name
    `
    const result = await client.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching departments:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    client.release()
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server with Authentication is running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Authentication endpoints available:`)
  console.log(`   POST /api/auth/signup - Create new account`)
  console.log(`   POST /api/auth/login - User login`)
  console.log(`   GET /api/auth/profile - Get user profile`)
  console.log(`   POST /api/auth/logout - User logout`)
})

module.exports = app
