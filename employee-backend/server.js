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
})

// Middleware
app.use(cors())
app.use(express.json())

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to database:", err)
  } else {
    console.log("Connected to PostgreSQL database")
    release()
  }
})

// Routes

// Dashboard Analytics
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const totalEmployeesQuery = `
      SELECT COUNT(*) as total_employees 
      FROM employees 
      WHERE status = 'Active'
    `

    const todayAttendanceQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN is_late = true AND status = 'Present' THEN 1 END) as late_count,
        COUNT(*) as total_records
      FROM attendance 
      WHERE attendance_date = CURRENT_DATE
    `

    const weeklyTrendQuery = `
      SELECT 
        TO_CHAR(attendance_date, 'Dy') as day,
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN is_late = true THEN 1 END) as late
      FROM attendance 
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY attendance_date, TO_CHAR(attendance_date, 'Dy')
      ORDER BY attendance_date
    `

    const departmentStatsQuery = `
      SELECT 
        d.department_name,
        COUNT(e.employee_id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.status = 'Active'
      GROUP BY d.department_id, d.department_name
      ORDER BY d.department_name
    `

    const [totalEmployees, todayAttendance, weeklyTrend, departmentStats] = await Promise.all([
      pool.query(totalEmployeesQuery),
      pool.query(todayAttendanceQuery),
      pool.query(weeklyTrendQuery),
      pool.query(departmentStatsQuery),
    ])

    res.json({
      totalEmployees: Number.parseInt(totalEmployees.rows[0].total_employees),
      todayAttendance: todayAttendance.rows[0],
      weeklyTrend: weeklyTrend.rows,
      departmentStats: departmentStats.rows,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Employee Management
app.get("/api/employees", async (req, res) => {
  try {
    const { department, search, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        e.employee_id,
        e.employee_name,
        e.email,
        e.phone,
        d.department_name,
        r.role_name,
        e.hire_date,
        e.salary,
        e.status,
        e.created_date
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

    if (search) {
      paramCount++
      query += ` AND (e.employee_name ILIKE $${paramCount} OR e.email ILIKE $${paramCount} OR d.department_name ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY e.employee_name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE 1=1
    `

    const countParams = []
    let countParamCount = 0

    if (department && department !== "all") {
      countParamCount++
      countQuery += ` AND d.department_name = $${countParamCount}`
      countParams.push(department)
    }

    if (search) {
      countParamCount++
      countQuery += ` AND (e.employee_name ILIKE $${countParamCount} OR e.email ILIKE $${countParamCount} OR d.department_name ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
    }

    const countResult = await pool.query(countQuery, countParams)

    res.json({
      employees: result.rows,
      total: Number.parseInt(countResult.rows[0].total),
      page: Number.parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/employees", async (req, res) => {
  try {
    const { employee_name, email, phone, department_id, role_id, hire_date, salary, status } = req.body

    const query = `
      INSERT INTO employees (employee_name, email, phone, department_id, role_id, hire_date, salary, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const result = await pool.query(query, [
      employee_name,
      email,
      phone,
      department_id,
      role_id,
      hire_date,
      salary,
      status || "Active",
    ])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating employee:", error)
    if (error.code === "23505") {
      // Unique violation
      res.status(400).json({ error: "Email already exists" })
    } else {
      res.status(500).json({ error: "Internal server error" })
    }
  }
})

app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { employee_name, email, phone, department_id, role_id, hire_date, salary, status } = req.body

    const query = `
      UPDATE employees 
      SET employee_name = $1, email = $2, phone = $3, department_id = $4, role_id = $5, 
          hire_date = $6, salary = $7, status = $8, updated_date = CURRENT_TIMESTAMP
      WHERE employee_id = $9
      RETURNING *
    `

    const result = await pool.query(query, [
      employee_name,
      email,
      phone,
      department_id,
      role_id,
      hire_date,
      salary,
      status,
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error updating employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params

    const query = "DELETE FROM employees WHERE employee_id = $1 RETURNING *"
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" })
    }

    res.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Attendance Management
app.get("/api/attendance", async (req, res) => {
  try {
    const { date, department, status, employee_id, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        a.attendance_id,
        a.employee_id,
        e.employee_name,
        d.department_name,
        a.attendance_date,
        a.check_in_time,
        a.check_out_time,
        a.work_hours,
        a.status,
        a.is_late,
        a.late_minutes,
        a.overtime_hours,
        a.notes
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE 1=1
    `

    const params = []
    let paramCount = 0

    if (date) {
      paramCount++
      query += ` AND a.attendance_date = $${paramCount}`
      params.push(date)
    }

    if (department && department !== "All") {
      paramCount++
      query += ` AND d.department_name = $${paramCount}`
      params.push(department)
    }

    if (status && status !== "All") {
      paramCount++
      query += ` AND a.status = $${paramCount}`
      params.push(status)
    }

    if (employee_id) {
      paramCount++
      query += ` AND a.employee_id = $${paramCount}`
      params.push(employee_id)
    }

    query += ` ORDER BY a.attendance_date DESC, e.employee_name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    res.json({
      attendance: result.rows,
      page: Number.parseInt(page),
    })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/attendance", async (req, res) => {
  try {
    const { employee_id, attendance_date, check_in_time, check_out_time, notes } = req.body

    const query = `
      INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (employee_id, attendance_date) 
      DO UPDATE SET 
        check_in_time = EXCLUDED.check_in_time,
        check_out_time = EXCLUDED.check_out_time,
        notes = EXCLUDED.notes,
        updated_date = CURRENT_TIMESTAMP
      RETURNING *
    `

    const result = await pool.query(query, [employee_id, attendance_date, check_in_time, check_out_time, notes])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating/updating attendance:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Check-in/Check-out endpoints
app.post("/api/attendance/checkin", async (req, res) => {
  try {
    const { employee_id } = req.body
    const today = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toTimeString().split(" ")[0]

    const query = `
      INSERT INTO attendance (employee_id, attendance_date, check_in_time)
      VALUES ($1, $2, $3)
      ON CONFLICT (employee_id, attendance_date) 
      DO UPDATE SET 
        check_in_time = EXCLUDED.check_in_time,
        updated_date = CURRENT_TIMESTAMP
      RETURNING *
    `

    const result = await pool.query(query, [employee_id, today, currentTime])

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error checking in:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/attendance/checkout", async (req, res) => {
  try {
    const { employee_id } = req.body
    const today = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toTimeString().split(" ")[0]

    const query = `
      UPDATE attendance 
      SET check_out_time = $1, updated_date = CURRENT_TIMESTAMP
      WHERE employee_id = $2 AND attendance_date = $3
      RETURNING *
    `

    const result = await pool.query(query, [currentTime, employee_id, today])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No check-in record found for today" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error checking out:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Department Management
app.get("/api/departments", async (req, res) => {
  try {
    const query = `
      SELECT 
        d.*,
        COUNT(e.employee_id) as employee_count,
        ROUND(AVG(
          CASE 
            WHEN a.status = 'Present' THEN 100.0
            WHEN a.status = 'Absent' THEN 0.0
            ELSE 50.0
          END
        ), 2) as avg_attendance_rate
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.status = 'Active'
      LEFT JOIN attendance a ON e.employee_id = a.employee_id 
        AND a.attendance_date >= CURRENT_DATE - INTERVAL '30 days'
      WHERE d.is_active = true
      GROUP BY d.department_id
      ORDER BY d.department_name
    `

    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching departments:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/departments", async (req, res) => {
  try {
    const { department_name, description, manager_name, budget, location } = req.body

    const query = `
      INSERT INTO departments (department_name, description, manager_name, budget, location)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    const result = await pool.query(query, [department_name, description, manager_name, budget, location])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating department:", error)
    if (error.code === "23505") {
      // Unique violation
      res.status(400).json({ error: "Department name already exists" })
    } else {
      res.status(500).json({ error: "Internal server error" })
    }
  }
})

// Reports
app.get("/api/reports/monthly-summary", async (req, res) => {
  try {
    const { month, year } = req.query
    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()

    const query = "SELECT * FROM get_monthly_attendance_summary($1, $2)"
    const result = await pool.query(query, [targetMonth, targetYear])

    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching monthly summary:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/reports/employee-summary", async (req, res) => {
  try {
    const { start_date, end_date, department } = req.query

    let query = `
      SELECT * FROM employee_attendance_summary
      WHERE 1=1
    `

    const params = []
    let paramCount = 0

    if (department && department !== "all") {
      paramCount++
      query += ` AND department_name = $${paramCount}`
      params.push(department)
    }

    query += ` ORDER BY attendance_percentage DESC`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching employee summary:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/reports/exceptions", async (req, res) => {
  try {
    const query = `
      SELECT 
        'Excessive Absences' as type,
        e.employee_name,
        d.department_name,
        COUNT(a.attendance_id) as absence_count,
        'High' as severity,
        MAX(a.attendance_date) as last_date
      FROM employees e
      JOIN departments d ON e.department_id = d.department_id
      JOIN attendance a ON e.employee_id = a.employee_id
      WHERE a.status = 'Absent' 
        AND a.attendance_date >= CURRENT_DATE - INTERVAL '14 days'
        AND e.status = 'Active'
      GROUP BY e.employee_id, e.employee_name, d.department_name
      HAVING COUNT(a.attendance_id) >= 3
      
      UNION ALL
      
      SELECT 
        'Consistent Late Arrivals' as type,
        e.employee_name,
        d.department_name,
        COUNT(a.attendance_id) as late_count,
        'Medium' as severity,
        MAX(a.attendance_date) as last_date
      FROM employees e
      JOIN departments d ON e.department_id = d.department_id
      JOIN attendance a ON e.employee_id = a.employee_id
      WHERE a.is_late = true 
        AND a.attendance_date >= CURRENT_DATE - INTERVAL '30 days'
        AND e.status = 'Active'
      GROUP BY e.employee_id, e.employee_name, d.department_name
      HAVING COUNT(a.attendance_id) >= 5
      
      ORDER BY severity DESC, last_date DESC
    `

    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching exception reports:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get roles by department
app.get("/api/roles", async (req, res) => {
  try {
    const { department_id } = req.query

    let query = `
      SELECT r.*, d.department_name
      FROM roles r
      JOIN departments d ON r.department_id = d.department_id
    `

    const params = []

    if (department_id) {
      query += " WHERE r.department_id = $1"
      params.push(department_id)
    }

    query += " ORDER BY d.department_name, r.role_name"

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching roles:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app
