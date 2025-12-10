# 1. Crear render.yaml
$renderConfig = @"
services:
  - type: web
    name: fantasy-betting-backend
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: fantasy-betting-db
          property: connectionString
      - key: PORT
        value: 5000

databases:
  - name: fantasy-betting-db
    databaseName: fantasy_betting
    user: fantasy_user
    plan: free
"@
Set-Content render.yaml -Value $renderConfig -Encoding UTF8

# 2. Assegurar engines al package.json
$pkgPath = "package.json"
$pkg = Get-Content $pkgPath | ConvertFrom-Json
if (-not $pkg.PSObject.Properties['engines']) {
    $pkg | Add-Member -NotePropertyName "engines" -NotePropertyValue @{ node = ">=18.0.0" }
    $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8
}

Write-Host "🚀 TOT LLEST! Ja pots pujar-ho a GitHub." -ForegroundColor Green