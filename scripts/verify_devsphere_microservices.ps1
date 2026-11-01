# DevSphere Microservices Automated Live Verification Runner
# Verifies Developer Service (8081), Project Service (8082), and Blog Service (8083)

$workspaceRoot = "c:\Users\N.AJAYKUMAR\Full Stack Proojects"
$devDir = Join-Path $workspaceRoot "microservices\developer-service"
$projDir = Join-Path $workspaceRoot "microservices\project-service"
$blogDir = Join-Path $workspaceRoot "microservices\blog-service"

Write-Host "=========================================================="
Write-Host " STARTING DEVSPhERE MICROSERVICES LIVE VERIFICATION "
Write-Host "=========================================================="

# 1. Start Services in Background
Write-Host "`n[1/4] Launching Developer Service on Port 8081..."
$devProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory $devDir -PassThru -NoNewWindow

Write-Host "[2/4] Launching Project Service on Port 8082..."
$projProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory $projDir -PassThru -NoNewWindow

Write-Host "[3/4] Launching Blog Service on Port 8083..."
$blogProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory $blogDir -PassThru -NoNewWindow

try {
    # 2. Wait for ports 8081, 8082, 8083 to become ready
    Write-Host "`n[4/4] Polling ports 8081, 8082, 8083..."
    $maxAttempts = 35
    $attempt = 0
    $allReady = $false

    while ($attempt -lt $maxAttempts -and -not $allReady) {
        Start-Sleep -Seconds 2
        $attempt++
        try {
            $t1 = (Test-NetConnection -ComputerName 127.0.0.1 -Port 8081 -InformationLevel Quiet -WarningAction SilentlyContinue)
            $t2 = (Test-NetConnection -ComputerName 127.0.0.1 -Port 8082 -InformationLevel Quiet -WarningAction SilentlyContinue)
            $t3 = (Test-NetConnection -ComputerName 127.0.0.1 -Port 8083 -InformationLevel Quiet -WarningAction SilentlyContinue)

            if ($t1 -and $t2 -and $t3) {
                $allReady = $true
                Write-Host "All 3 DevSphere microservices are ONLINE and listening! ($attempt checks)"
            } else {
                Write-Host "Waiting... (Port 8081: $t1, Port 8082: $t2, Port 8083: $t3)"
            }
        } catch {
            Write-Host "Checking connections..."
        }
    }

    if (-not $allReady) {
        throw "Timed out waiting for microservices to reach listening state."
    }

    Start-Sleep -Seconds 2

    # 3. Live API Tests
    Write-Host "`n================================================"
    Write-Host "TEST 1: Developer Service (8081) - GET /api/v1/developers"
    Write-Host "================================================"
    $devs = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers" -Method Get
    $devs | Select-Object -First 3 name, role, location | Format-Table -AutoSize
    Write-Host "Retrieved $($devs.Count) seeded DevSphere developers."

    Write-Host "`n================================================"
    Write-Host "TEST 2: Developer Service (8081) - POST /api/v1/developers"
    Write-Host "================================================"
    $newDev = @{
        name = "Marcus Vance"
        role = "Staff Systems Architect"
        description = "Specializing in distributed event-driven systems and microservices."
        location = "Canada"
        avatar = "a7"
        skills = @("Go", "Kubernetes", "gRPC", "Docker")
    } | ConvertTo-Json
    $savedDev = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers" -Method Post -ContentType "application/json" -Body $newDev
    Write-Host "Created developer ID: $($savedDev.id) - $($savedDev.name) ($($savedDev.role))"

    Write-Host "`n================================================"
    Write-Host "TEST 3: Developer Service (8081) - GET /api/v1/developers/{id}/stats"
    Write-Host "================================================"
    $devStats = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/developers/$($savedDev.id)/stats" -Method Get
    $devStats | ConvertTo-Json

    Write-Host "`n================================================"
    Write-Host "TEST 4: Project Service (8082) - GET /api/v1/projects"
    Write-Host "================================================"
    $projects = Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects" -Method Get
    $projects | Select-Object -First 3 title, category, authorName, likes, views | Format-Table -AutoSize
    Write-Host "Retrieved $($projects.Count) seeded DevSphere projects."

    Write-Host "`n================================================"
    Write-Host "TEST 5: Project Service (8082) - POST /api/v1/projects"
    Write-Host "================================================"
    $newProject = @{
        title = "CodePulse Telemetry Engine"
        category = "Cloud Architecture"
        description = "High-throughput telemetry and distributed trace processor for microservices."
        authorName = "Ajaykumar N"
        technologies = @("Spring Boot", "OpenTelemetry", "PostgreSQL", "Grafana")
        likes = 12
        views = 150
    } | ConvertTo-Json
    $savedProject = Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects" -Method Post -ContentType "application/json" -Body $newProject
    Write-Host "Created project ID: $($savedProject.id) - $($savedProject.title)"

    Write-Host "`n================================================"
    Write-Host "TEST 6: Project Service (8082) - POST /api/v1/projects/{id}/like"
    Write-Host "================================================"
    $liked = Invoke-RestMethod -Uri "http://localhost:8082/api/v1/projects/$($savedProject.id)/like" -Method Post
    Write-Host "Project '$($liked.title)' likes incremented to: $($liked.likes)"

    Write-Host "`n================================================"
    Write-Host "TEST 7: Blog Service (8083) - GET /api/v1/blogs"
    Write-Host "================================================"
    $blogs = Invoke-RestMethod -Uri "http://localhost:8083/api/v1/blogs" -Method Get
    $blogs | Select-Object -First 3 title, category, authorName, readTime | Format-Table -AutoSize
    Write-Host "Retrieved $($blogs.Count) seeded DevSphere blogs."

    Write-Host "`n================================================"
    Write-Host "TEST 8: Blog Service (8083) - POST /api/v1/blogs"
    Write-Host "================================================"
    $newBlog = @{
        title = "Building Resilient Microservices with Spring Boot 3"
        category = "Architecture"
        content = "Decomposing monoliths into focused microservices using Spring Data JPA, separate ports, and clean DTOs."
        authorName = "Ajay Kumar"
        tech = "Spring Boot"
        readTime = "8 min read"
        status = "PUBLISHED"
    } | ConvertTo-Json
    $savedBlog = Invoke-RestMethod -Uri "http://localhost:8083/api/v1/blogs" -Method Post -ContentType "application/json" -Body $newBlog
    Write-Host "Published blog ID: $($savedBlog.id) - '$($savedBlog.title)'"

    Write-Host "`n=========================================================="
    Write-Host " LIVE DEVSPhERE MICROSERVICES VERIFICATION: ALL 8 TESTS PASSED! "
    Write-Host "=========================================================="

} finally {
    Write-Host "`n=== Stopping Background Microservices ==="
    Stop-Process -Id $devProcess.Id, $projProcess.Id, $blogProcess.Id -Force -ErrorAction SilentlyContinue
    Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -gt (Get-Date).AddMinutes(-5) } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All background processes stopped cleanly."
}
