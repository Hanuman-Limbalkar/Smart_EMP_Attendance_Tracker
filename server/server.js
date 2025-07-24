const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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

    // Check if tables exist
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('departments', 'roles', 'employees', 'attendance')
      ORDER BY table_name
    `)

    console.log(
      "📋 Available tables:",
      tablesCheck.rows.map((row) => row.table_name),
    )

    // Check roles count
    const rolesCount = await client.query("SELECT COUNT(*) as count FROM roles")
    console.log("🎭 Total roles:", rolesCount.rows[0].count)

    client.release()
  } catch (err) {
    console.error("❌ Database connection failed:", err.message)
    process.exit(1)
  }
}

testConnection()

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const client = await pool.connect()
    await client.query("SELECT NOW()")
    client.release()
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "Connected",
    })
  } catch (error) {
    console.error("Health check failed:", error)
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "Disconnected",
      error: error.message,
    })
  }
})

// Get Departments with validation
app.get("/api/departments", async (req, res) => {
  const client = await pool.connect()
  try {
    const query = `
      SELECT 
        d.department_id,
        d.department_name,
        d.description,
        d.manager_name,
        d.budget,
        d.location,
        d.created_date,
        COUNT(e.employee_id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.status = 'Active'
      WHERE d.is_active = true
      GROUP BY d.department_id, d.department_name, d.description, d.manager_name, d.budget, d.location, d.created_date
      ORDER BY d.department_name
    `

    const result = await client.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching departments:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  } finally {
    client.release()
  }
})

// Get Roles with better validation
app.get("/api/roles", async (req, res) => {
  const client = await pool.connect()
  try {
    const { department_id } = req.query

    let query = `
      SELECT 
        r.role_id,
        r.role_name,
        r.department_id,
        r.base_salary,
        d.department_name
      FROM roles r
      JOIN departments d ON r.department_id = d.department_id
      WHERE d.is_active = true
    `

    const params = []

    if (department_id) {
      query += " AND r.department_id = $1"
      params.push(department_id)
    }

    query += " ORDER BY d.department_name, r.role_name"

    const result = await client.query(query, params)
    console.log(`📋 Found ${result.rows.length} roles`)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching roles:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  } finally {
    client.release()
  }
})

// Create Employee with better validation
app.post("/api/employees", async (req, res) => {
  const client = await pool.connect()
  try {
    const { employee_name, email, phone, department_id, role_id, hire_date, salary, status = "Active" } = req.body

    console.log("📝 Creating employee with data:", {
      employee_name,
      email,
      department_id,
      role_id,
      hire_date,
      status,
    })

    // Validate required fields
    if (!employee_name || !email || !hire_date) {
      return res.status(400).json({
        error: "Missing required fields: employee_name, email, hire_date",
      })
    }

    // Check if email already exists
    const emailCheck = await client.query("SELECT employee_id FROM employees WHERE email = $1", [email])
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" })
    }

    // Validate department exists if provided
    if (department_id) {
      const deptCheck = await client.query(
        "SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true",
        [department_id],
      )
      if (deptCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid department ID" })
      }
    }

    // Validate role exists if provided
    if (role_id) {
      const roleCheck = await client.query("SELECT role_id FROM roles WHERE role_id = $1", [role_id])
      if (roleCheck.rows.length === 0) {
        // Get available roles for debugging
        const availableRoles = await client.query(`
          SELECT r.role_id, r.role_name, d.department_name 
          FROM roles r 
          JOIN departments d ON r.department_id = d.department_id 
          ORDER BY r.role_id
        `)

        console.log("❌ Role ID not found:", role_id)
        console.log("✅ Available roles:", availableRoles.rows)

        return res.status(400).json({
          error: `Invalid role ID: ${role_id}`,
          availableRoles: availableRoles.rows,
        })
      }

      // Validate role belongs to department if both provided
      if (department_id) {
        const roleDepCheck = await client.query("SELECT role_id FROM roles WHERE role_id = $1 AND department_id = $2", [
          role_id,
          department_id,
        ])
        if (roleDepCheck.rows.length === 0) {
          return res.status(400).json({
            error: "Role does not belong to the selected department",
          })
        }
      }
    }

    const query = `
      INSERT INTO employees (
        employee_name, 
        email, 
        phone, 
        department_id, 
        role_id, 
        hire_date, 
        salary, 
        status
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

    console.log("✅ Employee created successfully:", result.rows[0])
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("❌ Error creating employee:", error)

    if (error.code === "23505") {
      res.status(400).json({ error: "Email already exists" })
    } else if (error.code === "23503") {
      // Foreign key constraint violation
      if (error.constraint === "employees_department_id_fkey") {
        res.status(400).json({ error: "Invalid department ID" })
      } else if (error.constraint === "employees_role_id_fkey") {
        res.status(400).json({ error: "Invalid role ID" })
      } else {
        res.status(400).json({ error: "Invalid reference ID" })
      }
    } else {
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
        code: error.code,
      })
    }
  } finally {
    client.release()
  }
})

// Get Employees
app.get("/api/employees", async (req, res) => {
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
        e.created_date,
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

    if (department && department !== "all" && department !== "All Departments") {
      paramCount++
      query += ` AND d.department_name = $${paramCount}`
      params.push(department)
    }

    if (search && search.trim() !== "") {
      paramCount++
      query += ` AND (
        e.employee_name ILIKE $${paramCount} OR 
        e.email ILIKE $${paramCount} OR 
        d.department_name ILIKE $${paramCount}
      )`
      params.push(`%${search.trim()}%`)
    }

    query += ` ORDER BY e.employee_name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await client.query(query, params)

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE 1=1
    `

    const countParams = []
    let countParamCount = 0

    if (department && department !== "all" && department !== "All Departments") {
      countParamCount++
      countQuery += ` AND d.department_name = $${countParamCount}`
      countParams.push(department)
    }

    if (search && search.trim() !== "") {
      countParamCount++
      countQuery += ` AND (
        e.employee_name ILIKE $${countParamCount} OR 
        e.email ILIKE $${countParamCount} OR 
        d.department_name ILIKE $${countParamCount}
      )`
      countParams.push(`%${search.trim()}%`)
    }

    const countResult = await client.query(countQuery, countParams)

    res.json({
      employees: result.rows,
      total: Number.parseInt(countResult.rows[0].total),
      page: Number.parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  } finally {
    client.release()
  }
})

// Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  const client = await pool.connect()
  try {
    const totalEmployeesQuery = `SELECT COUNT(*) as total_employees FROM employees WHERE status = 'Active'`
    const todayAttendanceQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN is_late = true AND status = 'Present' THEN 1 END) as late_count,
        COUNT(*) as total_records
      FROM attendance 
      WHERE attendance_date = CURRENT_DATE
    `

    const [totalEmployees, todayAttendance] = await Promise.all([
      client.query(totalEmployeesQuery),
      client.query(todayAttendanceQuery),
    ])

    res.json({
      totalEmployees: Number.parseInt(totalEmployees.rows[0].total_employees),
      todayAttendance: todayAttendance.rows[0],
      weeklyTrend: [],
      departmentStats: [],
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
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
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app
