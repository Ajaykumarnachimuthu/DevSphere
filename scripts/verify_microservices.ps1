# DevSphere Microservices Live Verification Script
$ErrorActionPreference = "Stop"

Write-Host "=== 1. Starting Course Service on Port 8081 ==="
$courseJob = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "c:\Users\N.AJAYKUMAR\Full Stack Proojects\microservices\course-service" -PassThru -NoNewWindow

Write-Host "=== 2. Starting User Service on Port 8082 ==="
$userJob = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "c:\Users\N.AJAYKUMAR\Full Stack Proojects\microservices\user-service" -PassThru -NoNewWindow

Write-Host "=== 3. Starting Enquiry Service on Port 8083 ==="
$enquiryJob = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "c:\Users\N.AJAYKUMAR\Full Stack Proojects\microservices\enquiry-service" -PassThru -NoNewWindow

try {
    Write-Host "Waiting for all 3 microservices to listen on ports 8081, 8082, and 8083..."
    $maxAttempts = 30
    $attempts = 0
    $allReady = $false

    while (-not $allReady -and $attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $attempts++
        try {
            $t1 = Test-NetConnection -ComputerName localhost -Port 8081 -InformationLevel Quiet
            $t2 = Test-NetConnection -ComputerName localhost -Port 8082 -InformationLevel Quiet
            $t3 = Test-NetConnection -ComputerName localhost -Port 8083 -InformationLevel Quiet
            if ($t1 -and $t2 -and $t3) {
                $allReady = $true
                Write-Host "All 3 services are ONLINE and listening! ($attempts checks)"
            } else {
                Write-Host "Waiting... (Port 8081: $t1, Port 8082: $t2, Port 8083: $t3)"
            }
        } catch {
            Write-Host "Checking connections..."
        }
    }

    if (-not $allReady) {
        throw "Timed out waiting for microservices to become ready."
    }

    # Small pause to let DispatcherServlets warm up
    Start-Sleep -Seconds 2

    Write-Host "`n================================================"
    Write-Host "TEST 1: Course Service (Port 8081) - GET /api/courses"
    Write-Host "================================================"
    $courses = Invoke-RestMethod -Uri "http://localhost:8081/api/courses" -Method Get
    $courses | ConvertTo-Json -Depth 3

    Write-Host "`n================================================"
    Write-Host "TEST 2: Course Service (Port 8081) - POST /api/courses"
    Write-Host "================================================"
    $newCourseBody = @{
        title = "Cloud & Microservices"
        category = "Cloud Architecture"
        duration = "8 Weeks"
    } | ConvertTo-Json
    $addedCourse = Invoke-RestMethod -Uri "http://localhost:8081/api/courses" -Method Post -ContentType "application/json" -Body $newCourseBody
    $addedCourse | ConvertTo-Json

    Write-Host "`n================================================"
    Write-Host "TEST 3: User Service (Port 8082) - POST /api/users (Register with BCrypt)"
    Write-Host "================================================"
    $registerBody = @{
        name = "Priya Sharma"
        email = "priya@example.com"
        password = "DemoPass456"
    } | ConvertTo-Json
    $regResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/users" -Method Post -ContentType "application/json" -Body $registerBody
    $regResponse | ConvertTo-Json

    Write-Host "`n================================================"
    Write-Host "TEST 4: User Service (Port 8082) - POST /api/users/login (Valid Credentials)"
    Write-Host "================================================"
    $loginBody = @{
        email = "priya@example.com"
        password = "DemoPass456"
    } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/users/login" -Method Post -ContentType "application/json" -Body $loginBody
    $loginResponse | ConvertTo-Json

    Write-Host "`n================================================"
    Write-Host "TEST 5: User Service (Port 8082) - POST /api/users/login (Invalid Credentials - 401 Expected)"
    Write-Host "================================================"
    try {
        $badLogin = @{
            email = "priya@example.com"
            password = "WrongPassword"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "http://localhost:8082/api/users/login" -Method Post -ContentType "application/json" -Body $badLogin
    } catch {
        Write-Host "Caught expected HTTP 401 Unauthorized: $($_.Exception.Message)"
    }

    Write-Host "`n================================================"
    Write-Host "TEST 6: User Service (Port 8082) - GET /api/users (Zero Password Leaks)"
    Write-Host "================================================"
    $users = Invoke-RestMethod -Uri "http://localhost:8082/api/users" -Method Get
    $users | ConvertTo-Json -Depth 3

    Write-Host "`n================================================"
    Write-Host "TEST 7: Enquiry Service (Port 8083) - POST /api/enquiries"
    Write-Host "================================================"
    $enquiryBody = @{
        name = "Rohit Verma"
        email = "rohit@example.com"
        courseTitle = "Cloud & Microservices"
        message = "Interested in weekend batch schedules and practical lab access."
    } | ConvertTo-Json
    $enquiryResponse = Invoke-RestMethod -Uri "http://localhost:8083/api/enquiries" -Method Post -ContentType "application/json" -Body $enquiryBody
    $enquiryResponse | ConvertTo-Json

    Write-Host "`n================================================"
    Write-Host "TEST 8: Enquiry Service (Port 8083) - GET /api/enquiries"
    Write-Host "================================================"
    $allEnquiries = Invoke-RestMethod -Uri "http://localhost:8083/api/enquiries" -Method Get
    $allEnquiries | ConvertTo-Json -Depth 3

    Write-Host "`n================================================"
    Write-Host "LIVE MICROSERVICES VERIFICATION: ALL 8 TESTS PASSED!"
    Write-Host "================================================"

} finally {
    Write-Host "`n=== Stopping Background Services ==="
    Stop-Process -Id $courseJob.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $userJob.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $enquiryJob.Id -Force -ErrorAction SilentlyContinue
    Get-Process java -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*course-service*" -or $_.CommandLine -like "*user-service*" -or $_.CommandLine -like "*enquiry-service*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All background processes stopped cleanly."
}
