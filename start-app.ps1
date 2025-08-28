Write-Host "🚀 Starting Freelancer Hub..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists in backend
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "✅ .env file created" -ForegroundColor Green
}

Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Set-Location ..
Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting the application..." -ForegroundColor Green
Write-Host "🌐 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

npm run dev 