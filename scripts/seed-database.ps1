# Seed the database with initial data
# Usage: pwsh -File scripts/seed-database.ps1

Write-Host "[DeedChain] Seeding database..." -ForegroundColor Cyan

pushd .\server
try {
  npm run prisma:seed
} finally {
  popd
}

Write-Host "[DeedChain] Database seed completed." -ForegroundColor Green
