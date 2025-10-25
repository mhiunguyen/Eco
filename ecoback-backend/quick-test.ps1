$body = '{"fullName":"Test User","email":"testuser@ecoback.vn","phone":"0999888777","password":"123456"}'

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
