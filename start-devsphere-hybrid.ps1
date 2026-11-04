# DevSphere — Master Hybrid Microservices Multi-Terminal Launcher
# Starts Blog Service (8081), Project Service (8082), DevSphere Core (8080), and React Frontend (5173) in separate PowerShell windows.

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  DEVSphere — Master Hybrid Microservices Architecture Launcher   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Root Directory: $rootDir" -ForegroundColor Yellow

$javaCmd = '
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23";
$env:Path = "C:\Program Files\Java\jdk-23\bin;" + $env:Path;
'

# 1. Start Blog Service (Port 8081)
Write-Host "[1/4] Launching Blog Microservice on Port 8081..." -ForegroundColor Green
$blogPath = Join-Path $rootDir "microservices\blog-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Blog Microservice on Port 8081...' -ForegroundColor Cyan; $javaCmd cd '$blogPath'; mvn spring-boot:run"

# 2. Start Project Service (Port 8082)
Write-Host "[2/4] Launching Project Microservice on Port 8082..." -ForegroundColor Green
$projectPath = Join-Path $rootDir "microservices\project-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Project Microservice on Port 8082...' -ForegroundColor Cyan; $javaCmd cd '$projectPath'; mvn spring-boot:run"

# Wait a brief moment for downstream services to initialize
Write-Host "Waiting 5 seconds for microservices to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

# 3. Start DevSphere Core API Gateway (Port 8080)
Write-Host "[3/4] Launching DevSphere Core Gateway on Port 8080..." -ForegroundColor Green
$corePath = Join-Path $rootDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting DevSphere Core (Gateway & Modular Monolith) on Port 8080...' -ForegroundColor Cyan; $javaCmd cd '$corePath'; mvn spring-boot:run"

# 4. Start React Frontend (Port 5173)
Write-Host "[4/4] Launching React Vite Frontend on Port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting React Frontend on Port 5173...' -ForegroundColor Cyan; cd '$rootDir'; npm run dev"

Write-Host ""
Write-Host "All 4 tiers launched successfully in separate terminal windows!" -ForegroundColor Green
Write-Host "  * React UI:            http://localhost:5173" -ForegroundColor White
Write-Host "  * DevSphere Core:      http://localhost:8080" -ForegroundColor White
Write-Host "  * Blog Service:        http://localhost:8081" -ForegroundColor White
Write-Host "  * Project Service:     http://localhost:8082" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan

