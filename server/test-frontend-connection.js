const http = require("http")

// Test function that mimics exactly what the frontend does
async function testFrontendRequest() {
  console.log("🧪 Testing Frontend Connection to Backend")
  console.log("=".repeat(50))

  // Test 1: Check if server is responding at all
  console.log("\n1. Testing basic connection...")

  const testBasicConnection = () => {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/health",
          method: "GET",
          timeout: 5000,
        },
        (res) => {
          let data = ""
          res.on("data", (chunk) => (data += chunk))
          res.on("end", () => {
            console.log("✅ Server responded!")
            console.log("📊 Status:", res.statusCode)
            console.log("📋 Headers:", res.headers)
            console.log("📦 Data:", data)
            resolve({ success: true, data, status: res.statusCode })
          })
        },
      )

      req.on("error", (err) => {
        console.log("❌ Connection failed:", err.message)
        resolve({ success: false, error: err.message })
      })

      req.on("timeout", () => {
        console.log("❌ Request timeout")
        resolve({ success: false, error: "timeout" })
      })

      req.end()
    })
  }

  const basicResult = await testBasicConnection()
  if (!basicResult.success) {
    console.log("\n🚨 Basic connection failed. Server might not be running.")
    return
  }

  // Test 2: Test the exact login request the frontend makes
  console.log("\n2. Testing login request (exactly like frontend)...")

  const testLoginRequest = () => {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        email: "admin@company.com",
        password: "admin123",
      })

      const req = http.request(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/auth/login",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
            Origin: "http://localhost:3000",
            "User-Agent": "Test-Script",
          },
          timeout: 5000,
        },
        (res) => {
          let data = ""
          res.on("data", (chunk) => (data += chunk))
          res.on("end", () => {
            console.log("✅ Login request completed!")
            console.log("📊 Status:", res.statusCode)
            console.log("📋 Headers:", res.headers)
            console.log("📦 Raw Data:", data)

            // Try to parse as JSON
            try {
              const parsed = JSON.parse(data)
              console.log("✅ Valid JSON response:", parsed)
              resolve({ success: true, data: parsed, status: res.statusCode })
            } catch (e) {
              console.log("❌ Invalid JSON response!")
              console.log("🔍 First 200 chars:", data.substring(0, 200))
              resolve({ success: false, error: "Invalid JSON", raw: data })
            }
          })
        },
      )

      req.on("error", (err) => {
        console.log("❌ Login request failed:", err.message)
        resolve({ success: false, error: err.message })
      })

      req.on("timeout", () => {
        console.log("❌ Login request timeout")
        resolve({ success: false, error: "timeout" })
      })

      req.write(postData)
      req.end()
    })
  }

  const loginResult = await testLoginRequest()

  if (loginResult.success) {
    console.log("\n🎉 All tests passed! Backend is working correctly.")
  } else {
    console.log("\n🚨 Login test failed!")
    console.log("🔧 This is likely the issue the frontend is experiencing.")
  }

  // Test 3: Check what happens with a browser-like request
  console.log("\n3. Testing with browser-like headers...")

  const testBrowserRequest = () => {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/health",
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (compatible; Test)",
            Origin: "http://localhost:3000",
            Referer: "http://localhost:3000/",
          },
          timeout: 5000,
        },
        (res) => {
          let data = ""
          res.on("data", (chunk) => (data += chunk))
          res.on("end", () => {
            console.log("📊 Browser-like request status:", res.statusCode)
            console.log("📦 Response:", data.substring(0, 100))
            resolve({ success: true, data })
          })
        },
      )

      req.on("error", (err) => {
        console.log("❌ Browser-like request failed:", err.message)
        resolve({ success: false, error: err.message })
      })

      req.end()
    })
  }

  await testBrowserRequest()
}

// Run the test
testFrontendRequest().catch(console.error)
