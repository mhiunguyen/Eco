# EcoBack API Testing

Base URL: http://localhost:5000

## Authentication Endpoints

### 1. Register User
POST /api/auth/register
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0912345678",
  "password": "123456",
  "referredByCode": ""
}
```

### 2. Login
POST /api/auth/login
```json
{
  "emailOrPhone": "nguyenvana@example.com",
  "password": "123456"
}
```
OR
```json
{
  "emailOrPhone": "0912345678",
  "password": "123456"
}
```

### 3. Get Current User
GET /api/auth/me
Headers:
```
Authorization: Bearer <your_jwt_token>
```

### 4. Update User Details
PUT /api/auth/updatedetails
Headers:
```
Authorization: Bearer <your_jwt_token>
```
Body:
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321"
}
```

### 5. Update Password
PUT /api/auth/updatepassword
Headers:
```
Authorization: Bearer <your_jwt_token>
```
Body:
```json
{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```

### 6. Forgot Password
POST /api/auth/forgotpassword
```json
{
  "email": "nguyenvana@example.com"
}
```

### 7. Reset Password
PUT /api/auth/resetpassword/:resetToken
Body:
```json
{
  "newPassword": "newpassword123"
}
```

### 8. Logout
POST /api/auth/logout
Headers:
```
Authorization: Bearer <your_jwt_token>
```

---

## Testing with cURL (Windows CMD)

### Register:
```cmd
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"0912345678\",\"password\":\"123456\"}"
```

### Login:
```cmd
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"emailOrPhone\":\"test@example.com\",\"password\":\"123456\"}"
```

### Get Me (replace TOKEN with your actual token):
```cmd
curl -X GET http://localhost:5000/api/auth/me -H "Authorization: Bearer TOKEN"
```

---

## Testing with PowerShell

### Register:
```powershell
$body = @{
    fullName = "Test User"
    email = "test@example.com"
    phone = "0912345678"
    password = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Login:
```powershell
$body = @{
    emailOrPhone = "test@example.com"
    password = "123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Get Me:
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers $headers
```

---

## Expected Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "0912345678",
    "role": "user",
    "wallet": {
      "balance": 0,
      "totalEarned": 0,
      "totalWithdrawn": 0
    },
    "level": 1,
    "xp": 0,
    "referralCode": "ABC12345",
    "createdAt": "2025-10-26T...",
    "updatedAt": "2025-10-26T..."
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Email đã được sử dụng",
  "errors": []
}
```

---

## Protected Routes

All protected routes require `Authorization: Bearer <token>` header.

If token is missing:
```json
{
  "success": false,
  "message": "Bạn cần đăng nhập để truy cập"
}
```

If token is invalid/expired:
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

---

## Notes

- JWT tokens expire in 30 days (configurable via JWT_EXPIRE in .env)
- Passwords are hashed using bcrypt (10 salt rounds)
- Referral system: Use `referredByCode` when registering to link to referrer
- Referrer receives 50,000 VND bonus for each successful referral
- User must be active (`isActive: true`) to login
