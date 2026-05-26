# BlueWing Airlines - Authentication API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Prerequisites
1. MongoDB running on `localhost:27017`
2. Backend server running: `npm run dev`
3. Postman or similar API testing tool

---

## 1. Register New User

### Endpoint
```
POST /api/auth/register
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "firstName": "Teja",
  "lastName": "Reddy",
  "email": "teja@test.com",
  "password": "Password1",
  "phone": "9876543210"
}
```

### Expected Success Response (Status: 201)
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "6652a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Teja",
      "lastName": "Reddy",
      "email": "teja@test.com",
      "phone": "9876543210",
      "role": "customer",
      "isEmailVerified": false,
      "createdAt": "2026-05-25T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

#### Duplicate Email (Status: 400)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

#### Validation Errors (Status: 400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "First name is required",
    "Password must contain uppercase, lowercase, and number"
  ]
}
```

### Field Validation Rules
| Field | Rules |
|-------|-------|
| firstName | Required, 2-50 characters |
| lastName | Required, 2-50 characters |
| email | Required, valid email format |
| password | Required, min 6 chars, must have uppercase + lowercase + number |
| phone | Required, 10 digits starting with 6-9 (Indian format) |

---

## 2. Login User

### Endpoint
```
POST /api/auth/login
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "teja@test.com",
  "password": "Password1"
}
```

### Expected Success Response (Status: 200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6652a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Teja",
      "lastName": "Reddy",
      "email": "teja@test.com",
      "phone": "9876543210",
      "role": "customer",
      "isEmailVerified": false,
      "createdAt": "2026-05-25T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

#### Invalid Credentials (Status: 401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Account Suspended (Status: 403)
```json
{
  "success": false,
  "message": "Your account has been suspended. Please contact support."
}
```

#### Missing Fields (Status: 400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password is required"
  ]
}
```

---

## 3. Get User Profile

### Endpoint
```
GET /api/auth/profile
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

> **Note:** Replace `<token>` with the JWT token received from login/register

### Expected Success Response (Status: 200)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6652a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Teja",
      "lastName": "Reddy",
      "email": "teja@test.com",
      "phone": "9876543210",
      "role": "customer",
      "isEmailVerified": false,
      "status": "active",
      "createdAt": "2026-05-25T10:30:00.000Z",
      "updatedAt": "2026-05-25T10:30:00.000Z"
    }
  }
}
```

### Error Responses

#### No Token Provided (Status: 401)
```json
{
  "status": "error",
  "message": "Not authorized"
}
```

#### Invalid/Expired Token (Status: 401)
```json
{
  "status": "error",
  "message": "Token invalid or expired"
}
```

---

## 4. Update User Profile

### Endpoint
```
PUT /api/auth/profile
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "firstName": "Tejashwini",
  "lastName": "Reddy",
  "phone": "9876543211"
}
```

### Expected Success Response (Status: 200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "6652a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Tejashwini",
      "lastName": "Reddy",
      "email": "teja@test.com",
      "phone": "9876543211",
      "role": "customer",
      "isEmailVerified": false,
      "createdAt": "2026-05-25T10:30:00.000Z",
      "updatedAt": "2026-05-25T10:35:00.000Z"
    }
  }
}
```

---

## 5. Health Check

### Endpoint
```
GET /api/health
```

### Expected Response (Status: 200)
```json
{
  "status": "success",
  "message": "Server running",
  "timestamp": "2026-05-25T10:30:00.000Z"
}
```

---

## Quick Testing Flow in Postman

### Step 1: Test Health Check
```
GET http://localhost:5000/api/health
```
✅ Should return "Server running"

### Step 2: Register a User
```
POST http://localhost:5000/api/auth/register
Body: (see above)
```
✅ Copy the `token` from response

### Step 3: Login with Same User
```
POST http://localhost:5000/api/auth/login
Body: { "email": "teja@test.com", "password": "Password1" }
```
✅ Should return new token

### Step 4: Get Profile (Protected Route)
```
GET http://localhost:5000/api/auth/profile
Headers: Authorization: Bearer <paste-token-here>
```
✅ Should return user data

### Step 5: Test Invalid Token
```
GET http://localhost:5000/api/auth/profile
Headers: Authorization: Bearer invalid-token-123
```
✅ Should return 401 "Token invalid or expired"

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Unable to connect" | Check if server is running on port 5000 |
| "Cannot connect to MongoDB" | Ensure MongoDB is running on port 27017 |
| "Validation failed" | Check field requirements in validation rules |
| "Token invalid" | Get fresh token from login endpoint |
| "Email already registered" | Use different email or login instead |

---

## cURL Commands (Alternative to Postman)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Teja","lastName":"Reddy","email":"teja@test.com","password":"Password1","phone":"9876543210"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teja@test.com","password":"Password1"}'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## PowerShell Commands

### Register
```powershell
$body = @{
  firstName = "Teja"
  lastName = "Reddy"
  email = "teja@test.com"
  password = "Password1"
  phone = "9876543210"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
  email = "teja@test.com"
  password = "Password1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Get Profile
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" -Method GET -Headers $headers
```
