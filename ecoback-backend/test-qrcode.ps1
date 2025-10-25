# Test QR Code System
# Make sure you have run test-auth.ps1 first to get a token

Write-Host "`n=== QR CODE SYSTEM TEST ===" -ForegroundColor Cyan

# 1. Get a product ID first
Write-Host "`n1. Getting products to find a product ID..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method Get
$productId = $products.data[0]._id
$productName = $products.data[0].name
Write-Host "Using Product: $productName (ID: $productId)" -ForegroundColor Green

# 2. Login as brand owner to generate QR codes
Write-Host "`n2. Logging in as brand owner..." -ForegroundColor Yellow
$brandLogin = @{
    email = "testapi@test.com"
    password = "Test@123"
} | ConvertTo-Json

$brandAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $brandLogin -ContentType "application/json"
$brandToken = $brandAuth.token
Write-Host "Brand owner logged in successfully!" -ForegroundColor Green

# 3. Generate QR code batch
Write-Host "`n3. Generating QR code batch (10 codes)..." -ForegroundColor Yellow
$generateBody = @{
    productId = $productId
    quantity = 10
    batchName = "Test Batch $(Get-Date -Format 'yyyy-MM-dd')"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $brandToken"
    "Content-Type" = "application/json"
}

try {
    $qrBatch = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/generate" -Method Post -Body $generateBody -Headers $headers
    Write-Host "✅ Generated $($qrBatch.count) QR codes!" -ForegroundColor Green
    Write-Host "   Batch ID: $($qrBatch.batchId)" -ForegroundColor Cyan
    Write-Host "   Cashback per code: $($qrBatch.data.cashbackAmount) VND" -ForegroundColor Cyan
    Write-Host "   Recycle reward: $($qrBatch.data.recycleReward) VND" -ForegroundColor Cyan
    
    # Save first QR code for testing
    $global:testQRCodeId = $qrBatch.data.codes[0].id
    $global:testQRCode = $qrBatch.data.codes[0].code
    Write-Host "   Sample Code: $global:testQRCode" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error generating QR codes: $($_.Exception.Message)" -ForegroundColor Red
    $_.Exception.Response
    exit
}

# 4. Get QR batches
Write-Host "`n4. Getting QR batches..." -ForegroundColor Yellow
try {
    $batches = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/batches" -Method Get -Headers $headers
    Write-Host "✅ Found $($batches.count) batches" -ForegroundColor Green
    foreach ($batch in $batches.data) {
        Write-Host "   Batch: $($batch.batchName) - $($batch.totalCodes) codes ($($batch.usedCodes) used, $($batch.recycledCodes) recycled)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error getting batches: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Now switch to regular user to scan and use QR codes
Write-Host "`n5. Creating/logging in as regular user..." -ForegroundColor Yellow
$userLogin = @{
    email = "qrtest@example.com"
    password = "Test@123"
} | ConvertTo-Json

try {
    $userAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $userLogin -ContentType "application/json"
    $userToken = $userAuth.token
    Write-Host "User logged in successfully!" -ForegroundColor Green
} catch {
    # User doesn't exist, create account
    Write-Host "Creating new user account..." -ForegroundColor Yellow
    $registerBody = @{
        name = "QR Test User"
        email = "qrtest@example.com"
        phone = "0901234567"
        password = "Test@123"
        role = "user"
    } | ConvertTo-Json
    
    $userAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    $userToken = $userAuth.token
    Write-Host "User created successfully!" -ForegroundColor Green
}

$userHeaders = @{
    "Authorization" = "Bearer $userToken"
    "Content-Type" = "application/json"
}

# 6. Scan QR code
Write-Host "`n6. Scanning QR code..." -ForegroundColor Yellow
$scanBody = @{
    code = $global:testQRCode
    location = @{
        type = "Point"
        coordinates = @(106.6297, 10.8231) # Ho Chi Minh City
    }
} | ConvertTo-Json

try {
    $scanResult = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/scan" -Method Post -Body $scanBody -Headers $userHeaders
    Write-Host "✅ QR Code scanned successfully!" -ForegroundColor Green
    Write-Host "   Product: $($scanResult.data.product.name)" -ForegroundColor Cyan
    Write-Host "   Status: $($scanResult.data.qrCode.status)" -ForegroundColor Cyan
    Write-Host "   Cashback available: $($scanResult.data.qrCode.cashbackAmount) VND" -ForegroundColor Cyan
    Write-Host "   Recycle reward: $($scanResult.data.qrCode.recycleReward) VND" -ForegroundColor Cyan
    Write-Host "   Can activate cashback: $($scanResult.data.qrCode.canActivateCashback)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error scanning QR code: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Activate cashback
Write-Host "`n7. Activating cashback..." -ForegroundColor Yellow
try {
    $cashback = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/$global:testQRCodeId/activate-cashback" -Method Post -Headers $userHeaders
    Write-Host "✅ Cashback activated!" -ForegroundColor Green
    Write-Host "   Amount received: $($cashback.data.cashbackAmount) VND" -ForegroundColor Cyan
    Write-Host "   New balance: $($cashback.data.newBalance) VND" -ForegroundColor Cyan
    Write-Host "   XP gained: +$($cashback.data.xpGained) XP" -ForegroundColor Cyan
    Write-Host "   Current level: $($cashback.data.currentLevel)" -ForegroundColor Cyan
    Write-Host "   Message: $($cashback.data.message)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error activating cashback: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Try to scan another QR for recycling test
Write-Host "`n8. Getting another QR code for recycle test..." -ForegroundColor Yellow
$secondQRCodeId = $qrBatch.data.codes[1].id
$secondQRCode = $qrBatch.data.codes[1].code

# Scan it first
$scanBody2 = @{
    code = $secondQRCode
} | ConvertTo-Json

try {
    $scanResult2 = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/scan" -Method Post -Body $scanBody2 -Headers $userHeaders
    Write-Host "✅ Second QR code scanned!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error scanning second QR: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Redeem recycle reward
Write-Host "`n9. Redeeming recycle reward..." -ForegroundColor Yellow
$recycleBody = @{
    location = @{
        type = "Point"
        coordinates = @(106.6297, 10.8231)
    }
} | ConvertTo-Json

try {
    $recycle = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/$secondQRCodeId/recycle" -Method Post -Body $recycleBody -Headers $userHeaders
    Write-Host "✅ Recycle reward redeemed!" -ForegroundColor Green
    Write-Host "   Reward: $($recycle.data.recycleReward) VND" -ForegroundColor Cyan
    Write-Host "   New balance: $($recycle.data.newBalance) VND" -ForegroundColor Cyan
    Write-Host "   XP gained: +$($recycle.data.xpGained) XP" -ForegroundColor Cyan
    Write-Host "   Level: $($recycle.data.currentLevel)" -ForegroundColor Cyan
    Write-Host "   Items recycled: $($recycle.data.environmentalImpact.itemsRecycled)" -ForegroundColor Cyan
    Write-Host "   Plastic saved: $($recycle.data.environmentalImpact.plasticSaved)g" -ForegroundColor Cyan
    Write-Host "   Message: $($recycle.data.message)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error redeeming recycle reward: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Get my scan history
Write-Host "`n10. Getting my scan history..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/my-scans" -Method Get -Headers $userHeaders
    Write-Host "✅ Found $($history.count) scans" -ForegroundColor Green
    foreach ($scan in $history.data) {
        Write-Host "   - $($scan.product.name) - Scanned at $($scan.scannedAt)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error getting scan history: $($_.Exception.Message)" -ForegroundColor Red
}

# 11. Get QR statistics (as brand owner)
Write-Host "`n11. Getting QR statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/qrcodes/stats" -Method Get -Headers $headers
    Write-Host "✅ QR Code Statistics:" -ForegroundColor Green
    Write-Host "   Total generated: $($stats.data.totalGenerated)" -ForegroundColor Cyan
    Write-Host "   Total used: $($stats.data.totalUsed)" -ForegroundColor Cyan
    Write-Host "   Total recycled: $($stats.data.totalRecycled)" -ForegroundColor Cyan
    Write-Host "   Total scans: $($stats.data.totalScans)" -ForegroundColor Cyan
    Write-Host "   Cashback distributed: $($stats.data.totalCashbackDistributed) VND" -ForegroundColor Cyan
    Write-Host "   Recycle rewards distributed: $($stats.data.totalRecycleRewardDistributed) VND" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error getting statistics: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== QR CODE SYSTEM TEST COMPLETE ===" -ForegroundColor Cyan
