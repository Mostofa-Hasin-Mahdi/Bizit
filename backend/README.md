# Bizit Backend API

FastAPI backend for Bizit Business Management Platform.

## Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Create database in PostgreSQL:**
```sql
CREATE DATABASE bizit_db;
```

3. **Initialize database tables:**
Run the SQL script to create tables:
```bash
psql -U postgres -d bizit_db -f init_db.sql
```

Or manually run the SQL commands from `init_db.sql` in pgAdmin.

4. **Set environment variables:**
The `.env` file is already configured with:
- Database: `postgresql://postgres:1234@localhost:5432/bizit_db`
- JWT Secret Key: (change in production)
- Token expiration: 30 minutes

5. **Run the server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (owner)
  - Body: `{ "email": "user@example.com", "username": "username", "password": "password123", "full_name": "Full Name" }`
- `POST /api/auth/login` - Login and get JWT token
  - Form data: `username` and `password`
  - Returns: `{ "access_token": "...", "token_type": "bearer" }`
- `GET /api/auth/me` - Get current user information
  - Headers: `Authorization: Bearer <token>`

## Testing with curl

**Register:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "test123", "full_name": "Test User"}'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=test123"
```

**Get current user:**
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer <your_token_here>"
```

## API Documentation

Once the server is running:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Schema

The database schema is defined in `init_db.sql`. The initial setup includes:
- `users` table
- `organizations` table
- `roles` table (owner, admin, employee)
- `user_roles` table
- `departments` table
- `user_departments` table

## Notes

- New users are automatically assigned the "owner" role
- Each owner gets a default organization created
- JWT tokens expire after 30 minutes (configurable in `.env`)
- Passwords are hashed using bcrypt

