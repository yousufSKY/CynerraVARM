# PowerShell script to fix Windows clock skew
# Run this as Administrator

Write-Host "Fixing Windows Clock Skew..." -ForegroundColor Cyan
Write-Host ""

# Stop Windows Time service
Write-Host "Stopping Windows Time service..." -ForegroundColor Yellow
Stop-Service w32time

# Unregister and re-register the service
Write-Host "Re-registering Windows Time service..." -ForegroundColor Yellow
w32tm /unregister
w32tm /register

# Start Windows Time service
Write-Host "Starting Windows Time service..." -ForegroundColor Yellow
Start-Service w32time

# Force time sync
Write-Host "Forcing time synchronization..." -ForegroundColor Yellow
w32tm /resync /force

Write-Host ""
Write-Host "Done! Your system clock should now be synchronized." -ForegroundColor Green
Write-Host "Please restart your development server (Ctrl+C and run 'npm run dev' again)" -ForegroundColor Cyan

