# Start Bible Study Hub - Frontend and Backend
Write-Host "Starting Bible Study Hub..." -ForegroundColor Green

# Start backend in background
$backendJob = Start-Job -ScriptBlock {
    Set-Location "backend"
    npm run dev
}

# Start frontend in background
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "backend"
    npm run dev:frontend
}

Write-Host "Backend job ID: $($backendJob.Id)" -ForegroundColor Yellow
Write-Host "Frontend job ID: $($frontendJob.Id)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Both services are starting up..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:12345" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Yellow

# Wait for jobs to start up
Start-Sleep -Seconds 5

# Check job status
Write-Host "Backend job state: $($backendJob.State)" -ForegroundColor Yellow
Write-Host "Frontend job state: $($frontendJob.State)" -ForegroundColor Yellow

# Display any errors
if ($backendJob.State -eq "Failed") {
    Write-Host "Backend job failed:" -ForegroundColor Red
    Receive-Job -Job $backendJob
}
if ($frontendJob.State -eq "Failed") {
    Write-Host "Frontend job failed:" -ForegroundColor Red
    Receive-Job -Job $frontendJob
}

# Keep running until user stops
Write-Host "Services are running. Press Ctrl+C to stop..." -ForegroundColor Green
try {
    Wait-Job -Job $backendJob, $frontendJob | Out-Null
} finally {
    Write-Host "Stopping services..." -ForegroundColor Red
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
}