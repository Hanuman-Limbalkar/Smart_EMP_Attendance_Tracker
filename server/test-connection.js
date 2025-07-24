const http = require("http")

function testEndpoint(path, method = "GET", data = null) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : null

    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    }

    if (postData) {
      options.headers["Content-Length"] = Buffer.byteLength(postData)
    }

    const req = http.request(options, (res) => {
      let responseData = ""

      res.on("data", (chunk) => {
        responseData += chunk
      })

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({
            success: true,
            status: res.statusCode,
            data: parsed,
            raw: responseData,
          })
        } catch (e) {
          resolve({
            success: false,
            status: res.statusCode,
            error: "Invalid JSON response",
            raw: responseData,
          })
        }
      })
    })

    req.on("error", (err) => {
      resolve({
        success: false,
        error: err.message,
      })
    })

    req.on("timeout", () => {
      resolve({
        success: false,
        error: "Request timeout",
      })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function runTests() {
  console.log("Testing Server Connection...")
  console.log("=".repeat(50))

  // Test 1: Health check
  console.log("\n1. Testing health endpoint...")
  const healthResult = await testEndpoint("/api/health")

  if (healthResult.success) {
    console.log("Health check passed")
    console.log("Status:", healthResult.status)
    console.log("Response:", healthResult.data)
  } else {
    console.log("Health check failed")
    console.log("Error:", healthResult.error)
    console.log("Raw response:", healthResult.raw)
    return
  }

  // Test 2: Login endpoint
  console.log("\n2. Testing login endpoint...")
  const loginResult = await testEndpoint("/api/auth/login", "POST", {
    email: "admin@company.com",
    password: "admin123",
  })

  if (loginResult.success) {
    console.log("✅ Login test passed")
    console.log("📊 Status:", loginResult.status)
    console.log("📦 Response:", loginResult.data)
  } else {
    console.log("❌ Login test failed")
    console.log("🔧 Error:", loginResult.error)
    console.log("📄 Raw response:", loginResult.raw)
  }

  console.log("\n🎉 Test completed!")
}

runTests().catch(console.error)
