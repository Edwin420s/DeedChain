# Deploy all components (blockchain, server, client)
# Usage: pwsh -File scripts/deploy-all.ps1

param(
    [string]$Network = "linea",
    [switch]$SkipContracts
)

Write-Host "[DeedChain] Starting full deployment..." -ForegroundColor Cyan

if (-not $SkipContracts) {
  Write-Host "[DeedChain] Deploying smart contracts..." -ForegroundColor Cyan
  # NOTE: Adjust paths/commands as needed for your local setup
  pushd .\blockchain
  try {
    npm run deploy -- --network $Network
  } finally {
    popd
  }
}

Write-Host "[DeedChain] Deploying server..." -ForegroundColor Cyan
pushd .\server
try {
  npm run deploy
} finally {
  popd
}

Write-Host "[DeedChain] Deploying client..." -ForegroundColor Cyan
pushd .\client
try {
  npm run build
  npm run start
} finally {
  popd
}

Write-Host "[DeedChain] Deployment completed." -ForegroundColor Green
