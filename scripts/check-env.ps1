# Validates required environment variables for DeedChain
# Usage: pwsh -File scripts/check-env.ps1

$errors = @()

function Require-Var($name) {
  $value = [Environment]::GetEnvironmentVariable($name, 'Process')
  if (-not $value) { $value = [Environment]::GetEnvironmentVariable($name, 'Machine') }
  if (-not $value) { $value = [Environment]::GetEnvironmentVariable($name, 'User') }
  if (-not $value) {
    $errors += "Missing env var: $name"
  }
}

Write-Host "[DeedChain] Checking required environment variables..." -ForegroundColor Cyan

Require-Var "CHAIN_NAME"
Require-Var "RPC_URL"
Require-Var "PRIVATE_KEY"
Require-Var "DATABASE_URL"

if ($errors.Count -gt 0) {
  Write-Host "[DeedChain] Env check FAILED" -ForegroundColor Red
  $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
  exit 1
} else {
  Write-Host "[DeedChain] Env check OK" -ForegroundColor Green
}
