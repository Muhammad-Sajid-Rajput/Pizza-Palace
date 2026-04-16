# Pizza Palace - Backend API

A full-stack pizza ordering system backend built with Node.js, Express, and MongoDB.

## Features

### Authentication & Authorization

- User registration with email verification
- User login with JWT tokens
- Admin and user roles
- Forgot password functionality
- Password reset via email

### Pizza Ordering System

- Custom pizza builder with multiple ingredient categories:
  - 5 Pizza bases (Thin Crust, Thick Crust, Stuffed Crust, Gluten-Free, Whole Wheat)
  - 5 Sauces (Tomato, BBQ, White, Pesto, Spicy)
  - 5 Cheese types (Mozzarella, Cheddar, Parmesan, Goat, Blue)
  - Multiple vegetable options
  - Multiple meat options

### Admin Features

- Complete inventory management system
- Track available ingredients and quantities
- Order management with status updates:
  - Order Received
  - In Kitchen
  - Sent to Delivery
  - Completed
- Dashboard with order statistics
- Low stock alerts via email
- Automatic inventory threshold monitoring

### Real-time Updates

- Order status changes reflected in user dashboard
- Automatic email notifications for low inventory
- Scheduled inventory checks every hour

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Email account for SMTP (Gmail recommended)

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pizzadb

# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (for Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=your_email@gmail.com
ADMIN_EMAIL=admin@pizzapalace.com

# Client URL (for email verification links)
CLIENT_URL=http://localhost:3000

# Server Port
PORT=5000
```

### 3. Database Setup

```bash
# Seed the database with initial ingredients and admin user
npm run seed
```

This will create:

- 25 ingredients across 5 categories
- Admin user: `admin@pizzapalace.com` / `admin123`

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Ingredients

- `GET /api/ingredients` - Get available ingredients for pizza building
- `GET /api/admin/ingredients` - Get all ingredients (admin)
- `POST /api/admin/ingredients` - Add new ingredient (admin)
- `PUT /api/admin/ingredients/:id` - Update ingredient (admin)
- `DELETE /api/admin/ingredients/:id` - Delete ingredient (admin)
- `GET /api/admin/ingredients/low-stock` - Get low stock items (admin)

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status (admin)
- `GET /api/admin/orders/stats` - Get order statistics (admin)

### Health Check

- `GET /api/health` - API health status

## Order Status Flow

1. **Received** - Order placed by customer
2. **Kitchen** - Order being prepared
3. **Delivery** - Order sent for delivery
4. **Done** - Order completed

## Inventory Management

- Automatic stock reduction when orders are placed
- Email alerts when ingredients fall below threshold
- Configurable threshold levels for each ingredient
- Scheduled monitoring every hour using cron jobs

## Email Notifications

The system sends emails for:

- Account verification
- Password reset
- Low inventory alerts to admin

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false
  }
}
```

### 2. Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 3. Verify Email

```http
GET /api/auth/verify-email/:token
```

### 4. Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 5. Reset Password

```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "newPassword123"
}
```

---

## 🍕 Ingredient Endpoints

### 1. Get Available Ingredients (Public)

```http
GET /ingredients
```

**Response:**

```json
{
  "success": true,
  "ingredients": {
    "bases": [
      {
        "_id": "INGREDIENT_ID",
        "name": "Thin Crust",
        "type": "base",
        "quantity": 50,
        "threshold": 10
      }
    ],
    "sauces": [...],
    "cheeses": [...],
    "veggies": [...],
    "meats": [...]
  }
}
```

### 2. Get All Ingredients (Admin Only)

```http
GET /admin/ingredients
Authorization: Bearer <admin_token>
```

### 3. Add New Ingredient (Admin Only)

```http
POST /admin/ingredients
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Spicy Pepperoni",
  "type": "meat",
  "quantity": 40,
  "threshold": 10
}
```

### 4. Update Ingredient (Admin Only)

```http
PUT /admin/ingredients/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "quantity": 45,
  "threshold": 12
}
```

### 5. Delete Ingredient (Admin Only)

```http
DELETE /admin/ingredients/:id
Authorization: Bearer <admin_token>
```

### 6. Get Low Stock Items (Admin Only)

```http
GET /admin/ingredients/low-stock
Authorization: Bearer <admin_token>
```

---

## 📦 Order Endpoints

### 1. Create Order

```http
POST /orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "base": "INGREDIENT_ID",
  "sauce": "INGREDIENT_ID",
  "cheese": "INGREDIENT_ID",
  "veggies": ["INGREDIENT_ID_1", "INGREDIENT_ID_2"],
  "meat": ["INGREDIENT_ID_1"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order placed successfully!",
  "order": {
    "_id": "ORDER_ID",
    "user": "USER_ID",
    "base": {...},
    "sauce": {...},
    "cheese": {...},
    "veggies": [...],
    "meat": [...],
    "status": "received",
    "createdAt": "2025-06-30T12:00:00.000Z"
  }
}
```

### 2. Get User's Orders

```http
GET /orders
Authorization: Bearer <user_token>
```

### 3. Get Specific Order

```http
GET /orders/:id
Authorization: Bearer <user_token>
```

### 4. Get All Orders (Admin Only)

```http
GET /admin/orders
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "_id": "ORDER_ID",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "base": {...},
      "sauce": {...},
      "cheese": {...},
      "veggies": [...],
      "meat": [...],
      "status": "received",
      "createdAt": "2025-06-30T12:00:00.000Z"
    }
  ],
  "totalOrders": 25
}
```

### 5. Update Order Status (Admin Only)

```http
PUT /admin/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "kitchen"
}
```

**Valid Status Values:** `received`, `kitchen`, `delivery`, `done`

### 6. Get Order Statistics (Admin Only)

```http
GET /admin/orders/stats
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalOrders": 150,
    "ordersByStatus": {
      "received": 5,
      "kitchen": 8,
      "delivery": 12,
      "done": 125
    },
    "todayOrders": 15,
    "thisWeekOrders": 45
  }
}
```

---

## 🔍 Health Check

### API Health Status

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "Pizza Palace API is running!",
  "timestamp": "2025-06-30T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 🧪 Testing the API

### Quick API Test

Run the included test script to verify all endpoints:

```bash
# Windows
.\test-api.bat

# The script will generate JSON files with tokens and IDs for manual testing
```

### Manual Testing Examples

After running the test script, you'll have these files:

- `ingredients.json` - All ingredients with their IDs
- `user_login.json` - User token for authenticated requests
- `admin_login.json` - Admin token for admin requests

#### Step-by-Step Testing

1. **Health Check**

```bash
curl -X GET http://localhost:3001/api/health
```

2. **Get Ingredients**

```bash
curl -X GET http://localhost:3001/api/ingredients
```

3. **User Login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

4. **Create Order** (use token from step 3 and IDs from step 2)

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "base": "INGREDIENT_ID",
    "sauce": "INGREDIENT_ID",
    "cheese": "INGREDIENT_ID",
    "veggies": ["INGREDIENT_ID_1", "INGREDIENT_ID_2"],
    "meat": ["INGREDIENT_ID_1"]
  }'
```

5. **Admin Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pizzapalace.com","password":"admin123"}'
```

6. **View All Orders** (admin only)

```bash
curl -X GET http://localhost:5000/api/admin/orders \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

7. **Update Order Status** (admin only)

```bash
curl -X PUT http://localhost:5000/api/admin/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"status": "kitchen"}'
```

### Postman Collection

You can also import these endpoints into Postman for easier testing:

**Environment Variables:**

- `BASE_URL`: http://localhost:5000/api
- `USER_TOKEN`: (from login response)
- `ADMIN_TOKEN`: (from admin login response)

### API Testing Results ✅

All endpoints have been tested and verified:

- ✅ Health Check - Working
- ✅ Get Ingredients - Working (30 ingredients loaded)
- ✅ User Login - Working (test users available)
- ✅ Admin Login - Working (admin account ready)
- ✅ Create Order - Working (inventory updates automatically)
- ✅ View User Orders - Working (real-time status updates)
- ✅ Admin View All Orders - Working
- ✅ Update Order Status - Working (kitchen → delivery → done)
- ✅ Admin Ingredients Management - Working
- ✅ Order Statistics - Working
- ✅ Inventory Monitoring - Working (email alerts enabled)

## Project Structure

```
src/
├── config/
│   └── database.js          # Database connection
├── handlers/
│   ├── authHandler.js       # Authentication logic
│   ├── ingredientHandler.js # Ingredient management
│   └── orderHandler.js      # Order management
├── middlewares/
│   └── protectMiddleware.js # JWT authentication middleware
├── models/
│   ├── user.js             # User schema
│   ├── order.js            # Order schema
│   └── ingeridents.js      # Ingredient schema
├── routes/
│   └── index.js            # API routes
├── scripts/
│   └── seedDatabase.js     # Database seeding script
└── utils/
    ├── mailer.js           # Email utility
    ├── token.js            # JWT utility
    └── inventoryCheck.js   # Inventory monitoring
```

## Notes

- Payment integration has been intentionally omitted as requested
- Orders are automatically confirmed without payment processing
- The system focuses on inventory management and order tracking
- Email functionality requires proper SMTP configuration
- MongoDB must be running before starting the server

## Next Steps for Frontend Integration

This backend API is ready to be integrated with a React frontend. The frontend should implement:

1. User registration and login forms
2. Pizza builder interface with ingredient selection
3. User dashboard showing order history and status
4. Admin dashboard for inventory and order management
5. Real-time updates for order status changes
