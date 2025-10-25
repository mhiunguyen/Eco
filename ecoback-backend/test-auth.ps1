# Test 1: Register new user
Write-Host "`n=== TEST 1: REGISTER USER ===" -ForegroundColor Cyan

$registerBody = @{
    fullName = "Nguyen Van A"
    email = "test@ecoback.vn"
    phone = "0912345678"
    password = "123456"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Register Success!" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.token.Substring(0,20))..." -ForegroundColor Yellow
    Write-Host "User: $($registerResponse.user.fullName)" -ForegroundColor Yellow
    Write-Host "Email: $($registerResponse.user.email)" -ForegroundColor Yellow
    Write-Host "Referral Code: $($registerResponse.user.referralCode)" -ForegroundColor Yellow
    
    $global:token = $registerResponse.token
    $global:userId = $registerResponse.user._id
} catch {
    Write-Host "❌ Register Failed: $($_.Exception.Message)" -ForegroundColor Red
    $_.Exception.Response | ConvertFrom-Json
}

# Test 2: Login
Write-Host "`n=== TEST 2: LOGIN ===" -ForegroundColor Cyan

$loginBody = @{
    emailOrPhone = "test@ecoback.vn"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login Success!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Yellow
    Write-Host "User: $($loginResponse.user.fullName)" -ForegroundColor Yellow
    
    $global:token = $loginResponse.token
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Me (Protected Route)
Write-Host "`n=== TEST 3: GET ME (Protected) ===" -ForegroundColor Cyan

$headers = @{
    Authorization = "Bearer $global:token"
}

try {
    $meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Get Me Success!" -ForegroundColor Green
    Write-Host "User ID: $($meResponse.data._id)" -ForegroundColor Yellow
    Write-Host "Full Name: $($meResponse.data.fullName)" -ForegroundColor Yellow
    Write-Host "Email: $($meResponse.data.email)" -ForegroundColor Yellow
    Write-Host "Phone: $($meResponse.data.phone)" -ForegroundColor Yellow
    Write-Host "Level: $($meResponse.data.level) | XP: $($meResponse.data.xp)" -ForegroundColor Yellow
    Write-Host "Wallet Balance: $($meResponse.data.wallet.balance) VND" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Get Me Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Login with Phone
Write-Host "`n=== TEST 4: LOGIN WITH PHONE ===" -ForegroundColor Cyan

$loginPhoneBody = @{
    emailOrPhone = "0912345678"
    password = "123456"
} | ConvertTo-Json

try {
    $loginPhoneResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginPhoneBody -ContentType "application/json"
    Write-Host "✅ Login with Phone Success!" -ForegroundColor Green
    Write-Host "User: $($loginPhoneResponse.user.fullName)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Login with Phone Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Update Details
Write-Host "`n=== TEST 5: UPDATE USER DETAILS ===" -ForegroundColor Cyan

$updateBody = @{
    fullName = "Nguyen Van B Updated"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/updatedetails" -Method Put -Body $updateBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Update Details Success!" -ForegroundColor Green
    Write-Host "New Name: $($updateResponse.data.fullName)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Update Details Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Register Duplicate (Should Fail)
Write-Host "`n=== TEST 6: REGISTER DUPLICATE (Should Fail) ===" -ForegroundColor Cyan

$duplicateBody = @{
    fullName = "Test Duplicate"
    email = "test@ecoback.vn"
    phone = "0999999999"
    password = "123456"
} | ConvertTo-Json

try {
    $duplicateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $duplicateBody -ContentType "application/json"
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected duplicate email!" -ForegroundColor Green
    Write-Host "Error: Email đã được sử dụng" -ForegroundColor Yellow
}

# Test 7: Login Wrong Password (Should Fail)
Write-Host "`n=== TEST 7: LOGIN WRONG PASSWORD (Should Fail) ===" -ForegroundColor Cyan

$wrongPassBody = @{
    emailOrPhone = "test@ecoback.vn"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $wrongPassResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $wrongPassBody -ContentType "application/json"
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected wrong password!" -ForegroundColor Green
    Write-Host "Error: Thông tin đăng nhập không chính xác" -ForegroundColor Yellow
}

# Test 8: Access Protected Route Without Token (Should Fail)
Write-Host "`n=== TEST 8: PROTECTED ROUTE WITHOUT TOKEN (Should Fail) ===" -ForegroundColor Cyan

try {
    $noTokenResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly blocked access without token!" -ForegroundColor Green
    Write-Host "Error: Bạn cần đăng nhập để truy cập" -ForegroundColor Yellow
}

Write-Host "`n=== ALL TESTS COMPLETED ===" -ForegroundColor Cyan
Write-Host "Saved Token: $($global:token.Substring(0,30))..." -ForegroundColor Yellow
