# Start Bible Study Hub - Backend (serves frontend statically)
Write-Host "Starting Bible Study Hub..." -ForegroundColor Green

# Start backend in background (serves both API and static frontend)
$backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "backend" -NoNewWindow -PassThru

Write-Host "Backend process ID: $($backendProcess.Id)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Service is starting up..." -ForegroundColor Green
Write-Host "Application will be available at: http://localhost:8086" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow

# Wait for job to start up
Start-Sleep -Seconds 5

# Check process status
if ($backendProcess.HasExited) {
    Write-Host "Backend process has exited with code: $($backendProcess.ExitCode)" -ForegroundColor Red
} else {
    Write-Host "Backend process is running" -ForegroundColor Green
}

# Keep running until user stops
Write-Host "Service is running. Press Ctrl+C to stop..." -ForegroundColor Green
try {
    $backendProcess.WaitForExit()
} finally {
    Write-Host "Stopping service..." -ForegroundColor Red
    if (!$backendProcess.HasExited) {
        $backendProcess.Kill()
    }
}