# Test Wallet & Transaction System
Write-Host "`n=== WALLET & TRANSACTION SYSTEM TEST ===" -ForegroundColor Cyan

# Use existing auth token
if (-not $global:token) {
    Write-Host "❌ No auth token found. Please run test-auth.ps1 first." -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $global:token"
    "Content-Type" = "application/json"
}

# 1. Check initial wallet
Write-Host "`n1. Checking initial wallet..." -ForegroundColor Yellow
try {
    $wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet" -Method Get -Headers $headers
    Write-Host "✅ Initial Balance: $($wallet.data.balance) VND" -ForegroundColor Green
    Write-Host "   Total Earned: $($wallet.data.totalEarned) VND" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Get transaction history
Write-Host "`n2. Checking transaction history..." -ForegroundColor Yellow
try {
    $transactions = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?limit=10" -Method Get -Headers $headers
    Write-Host "✅ Total Transactions: $($transactions.count)" -ForegroundColor Green
    
    if ($transactions.count -gt 0) {
        Write-Host "`nRecent Transactions:" -ForegroundColor Cyan
        $transactions.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "   - $($_.type): $($_.amount) VND [$($_.status)]" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test transaction filtering
Write-Host "`n3. Testing transaction filters..." -ForegroundColor Yellow
try {
    # Filter by type
    $cashbacks = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?type=cashback" -Method Get -Headers $headers
    Write-Host "✅ Cashback transactions: $($cashbacks.count)" -ForegroundColor Green
    
    # Filter by status
    $completed = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?status=completed" -Method Get -Headers $headers
    Write-Host "✅ Completed transactions: $($completed.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Get wallet statistics
Write-Host "`n4. Getting wallet statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/stats" -Method Get -Headers $headers
    Write-Host "✅ Wallet Stats:" -ForegroundColor Green
    Write-Host "   Current Balance: $($stats.data.currentBalance) VND" -ForegroundColor Cyan
    Write-Host "   Total Earned: $($stats.data.totalEarned) VND" -ForegroundColor Cyan
    Write-Host "   Total Withdrawn: $($stats.data.totalWithdrawn) VND" -ForegroundColor Cyan
    
    if ($stats.data.byType -and $stats.data.byType.Count -gt 0) {
        Write-Host "`n   Earnings by Type:" -ForegroundColor Yellow
        $stats.data.byType | ForEach-Object {
            Write-Host "      - $($_._id): $($_.total) VND ($($_.count) transactions)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test withdrawal with insufficient balance
Write-Host "`n5. Testing withdrawal validation..." -ForegroundColor Yellow
$withdrawBody = @{
    amount = 50000
    bankInfo = @{
        bankName = "Vietcombank"
        accountNumber = "1234567890"
        accountName = "Test User"
        branch = "HCMC Branch"
    }
} | ConvertTo-Json -Depth 3

try {
    $withdrawal = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/withdraw" -Method Post -Body $withdrawBody -Headers $headers
    Write-Host "✅ Withdrawal requested: $($withdrawal.data.amount) VND" -ForegroundColor Green
} catch {
    $errorMsg = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "❌ Expected validation error: $($errorMsg.message)" -ForegroundColor Red
}

# 6. Test minimum withdrawal amount
Write-Host "`n6. Testing minimum withdrawal amount..." -ForegroundColor Yellow
$smallWithdraw = @{
    amount = 10000
    bankInfo = @{
        bankName = "Vietcombank"
        accountNumber = "1234567890"
        accountName = "Test User"
    }
} | ConvertTo-Json -Depth 3

try {
    $withdrawal = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/withdraw" -Method Post -Body $smallWithdraw -Headers $headers
} catch {
    $errorMsg = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "❌ Expected error: $($errorMsg.message)" -ForegroundColor Red
}

# 7. Get withdrawal list
Write-Host "`n7. Getting withdrawal requests..." -ForegroundColor Yellow
try {
    $withdrawals = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/withdrawals" -Method Get -Headers $headers
    Write-Host "✅ Total Withdrawal Requests: $($withdrawals.count)" -ForegroundColor Green
    
    if ($withdrawals.count -gt 0) {
        $withdrawals.data | ForEach-Object {
            Write-Host "   - $($_.amount) VND [$($_.status)] - $($_.createdAt)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Test date range filtering
Write-Host "`n8. Testing date range filter..." -ForegroundColor Yellow
$today = Get-Date -Format "yyyy-MM-dd"
$lastMonth = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")

try {
    $recent = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions?from=$lastMonth&to=$today" -Method Get -Headers $headers
    Write-Host "✅ Transactions in last 30 days: $($recent.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== WALLET SYSTEM TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "`n💡 Note: To test with actual balance, activate QR code cashback first!" -ForegroundColor Yellow
Write-Host "   1. Generate QR codes with a product that has cashbackPercentage set" -ForegroundColor Gray
Write-Host "   2. Scan and activate cashback on the QR code" -ForegroundColor Gray
Write-Host "   3. Then try withdrawal again`n" -ForegroundColor Gray
