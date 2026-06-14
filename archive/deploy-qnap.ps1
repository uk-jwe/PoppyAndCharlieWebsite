# Deploy Poppy & Charlie website to QNAP NAS
# Run from the project root: .\deploy-qnap.ps1
# Prerequisites: npm run build must have been run first (or use -Build flag to build here)

param(
    [switch]$Build,
    [string]$QnapPath = "\\NAS5D0374\Container\PoppyAndCharlie"
)

$ErrorActionPreference = "Stop"
$StageDir = ".\deploy-staging"

# Optionally build before deploying
if ($Build) {
    Write-Host "Building Next.js application..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
}

# Verify standalone output exists
if (-not (Test-Path ".\.next\standalone")) {
    Write-Error "No standalone build found. Run 'npm run build' first, or use -Build flag."
    exit 1
}

Write-Host "Preparing deploy staging directory..." -ForegroundColor Cyan

if (Test-Path $StageDir) {
    Remove-Item $StageDir -Recurse -Force
}
New-Item $StageDir -ItemType Directory | Out-Null

# Copy standalone Next.js output
Write-Host "Copying standalone build..." -ForegroundColor Gray
robocopy ".\.next\standalone" "$StageDir\standalone" /E /MIR /NFL /NDL /NJH /NJS | Out-Null

# Copy static assets into the standalone directory (required by Next.js standalone)
robocopy ".\.next\static" "$StageDir\standalone\.next\static" /E /MIR /NFL /NDL /NJH /NJS | Out-Null
robocopy ".\public" "$StageDir\standalone\public" /E /MIR /NFL /NDL /NJH /NJS | Out-Null

# Install Linux musl sharp into a clean temp dir then copy into standalone node_modules.
# We can't run npm install directly in standalone because it triggers post-install scripts
# for existing packages (esbuild etc.) which fail on Windows.
Write-Host "Installing Linux musl sharp for production..." -ForegroundColor Cyan
$SharpTemp = "$StageDir\sharp-temp"
New-Item $SharpTemp -ItemType Directory | Out-Null
npm install --prefix $SharpTemp --os=linux --libc=musl --cpu=x64 sharp --no-package-lock --loglevel=error | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Linux sharp install failed" }
# Copy sharp + @img platform packages into standalone node_modules
Copy-Item "$SharpTemp\node_modules\sharp" "$StageDir\standalone\node_modules\sharp" -Recurse -Force
if (Test-Path "$SharpTemp\node_modules\@img") {
    New-Item "$StageDir\standalone\node_modules\@img" -ItemType Directory -Force | Out-Null
    Get-ChildItem "$SharpTemp\node_modules\@img" | ForEach-Object {
        Copy-Item $_.FullName "$StageDir\standalone\node_modules\@img\" -Recurse -Force
    }
}
Write-Host "Linux sharp installed." -ForegroundColor Green

# Copy Docker deployment files (rename Dockerfile.qnap -> Dockerfile for the QNAP compose)
Copy-Item ".\docker\Dockerfile.qnap"          "$StageDir\Dockerfile"
Copy-Item ".\docker\docker-compose.qnap.yml"  "$StageDir\docker-compose.yml"
Copy-Item ".\.env.example"                    "$StageDir\.env.example"

Write-Host "Deploy staging ready." -ForegroundColor Green
Write-Host ""

# Copy to QNAP if path is provided and reachable
if ($QnapPath -and (Test-Path $QnapPath)) {
    Write-Host "Copying to QNAP at $QnapPath..." -ForegroundColor Cyan
    robocopy $StageDir $QnapPath /E /MIR /NFL /NDL /NJH /NJS /XF .env | Out-Null
    Write-Host "Files copied to QNAP." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps on the QNAP:" -ForegroundColor Yellow
    Write-Host "  First-time / Dockerfile changed:"
    Write-Host "    sudo docker compose down && sudo docker rmi poppyandcharlie && sudo docker compose up -d --build"
    Write-Host "  Normal deploy (code change only):"
    Write-Host "    sudo docker compose restart"
} else {
    Write-Host "QNAP path not found or not specified. Staging files are at: $StageDir" -ForegroundColor Yellow
    Write-Host "Copy this directory to your QNAP and run: docker compose up -d --build"
}
