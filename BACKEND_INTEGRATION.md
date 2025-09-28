# Backend API Integration Guide

## Environment Setup

Your `.env.local` now contains:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## API Integration Flow

### 1. **Frontend → API Utils → Backend**

```typescript
// Frontend calls (AuthContext.tsx)
const authData = await authAPI.register({
  name: "John Doe",
  email: "john@example.com", 
  password: "securepass123"
});
```

### 2. **API Utils** (`src/lib/api.ts`)
- Handles all HTTP requests
- Manages error handling
- Provides type safety
- Centralized configuration

### 3. **Expected Backend Response Format**

Your backend API should respond with this structure:

#### **Success Response (Status 200/201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg" // optional
    }
  }
}
```

#### **Error Response (Status 400/401/500):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

## Backend API Endpoints

### **POST /api/auth/register**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### **POST /api/auth/login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### **GET /api/auth/verify** (Optional)
```bash
curl -X GET http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Testing the Integration

### **1. Start your backend server on port 8000**
```bash
# Your backend should run on http://localhost:8000
# Make sure /api/auth/register endpoint exists
```

### **2. Test the registration flow**
- Go to http://localhost:3000/auth
- Fill out the registration form
- Check browser console for API calls
- Check your backend logs

### **3. Fallback Behavior**
If your backend is not running:
- The app will log "Backend unavailable"  
- Fall back to mock data for development
- Users can still test the UI flow

## Example Backend Implementation (Node.js/Express)

```javascript
// Example backend endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Your registration logic here
    const user = await createUser({ name, email, password });
    const token = generateJWT(user.id);
    
    res.status(201).json({
      success: true,
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }
      }
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});
```

## Error Handling

The frontend handles these error scenarios:
- **Network errors** (backend down)
- **Validation errors** (400 status)
- **Authentication errors** (401 status)
- **Server errors** (500 status)

## Next Steps

1. **Update the API_BASE_URL** in `.env.local` to match your backend
2. **Implement the backend endpoints** with the expected response format
3. **Test the integration** by registering a new user
4. **Remove mock fallbacks** once your backend is stable

The frontend is now ready to work with your real backend API! 🚀