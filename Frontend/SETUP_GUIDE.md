# AI Clinic Management System - Setup Guide

## 📋 Project Structure

```
Smit-hackethon/
├── Backend/
│   ├── controllers/     (Business logic)
│   ├── models/          (Database schemas)
│   ├── routes/          (API endpoints)
│   ├── middleware/      (Auth, upload)
│   ├── .env             (Environment variables)
│   ├── package.json
│   └── server.js        (Main entry point)
└── src/
    ├── components/      (React components)
    ├── context/         (Auth context)
    ├── services/        (API calls)
    ├── App.jsx
    └── main.jsx
├── .env                 (Frontend env)
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

### 1️⃣ Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create/Update .env file
cat > .env << EOF
PORT=5000
MONGODB_URI="mongodb+srv://muhammadmaviya1201_db_user:organize123@cluster0.m4rilk5.mongodb.net/"
JWT_SECRET=smit123
GEMINI_API_KEY="AIzaSyDVyxkVsSfN-f5FZMI_XbXLBztGxBFfkgs"
CLOUDINARY_CLOUD_NAME="dh2o8yxtd"
CLOUDINARY_API_KEY="935152929542951"
CLOUDINARY_API_SECRET="zlfURVOaDg3U9JTzr1asVAWBT6g"
EOF

# Start server
npm run dev
# Server runs on http://localhost:5000
```

### 2️⃣ Frontend Setup

```bash
# In root directory (Smit-hackethon/)
npm install

# The .env file is already created with:
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
# Frontend runs on http://localhost:5173 (Vite default)
```

## 🔐 Authentication Flow

### Registration
1. User clicks "Sign Up" on home page
2. Fills in: Name, Email, Password, Role, (optional: Specialization for Doctors)
3. POST request to `/api/auth/register`
4. Backend validates and creates user in MongoDB
5. Returns JWT token and user data
6. Frontend stores token in localStorage
7. User redirected to their role-based dashboard

### Login
1. User selects role and logs in
2. POST request to `/api/auth/login`
3. Backend validates credentials
4. Returns JWT token
5. Frontend stores token and user info
6. Subsequent requests include token in headers

### Protected Routes
- All dashboard routes require authentication
- Token automatically added to API requests via axios interceptor
- If token expires (401), user redirected to login

## 📁 Key Components

### Frontend Components
- **Home.jsx** - Landing page with role cards
- **Login.jsx** - Login form for all roles
- **Register.jsx** - Registration form with role selection
- **Sidebar.jsx** - Navigation with role-based menu icons
- **Admin/Doctor/Receptionist/Patient Dashboards** - Role-specific pages

### API Endpoints

#### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/password` - Change password (protected)

#### Other Modules
- `/api/users` - User management
- `/api/doctors` - Doctor operations
- `/api/patients` - Patient operations
- `/api/appointments` - Appointment management
- `/api/prescriptions` - Prescription management
- `/api/admin` - Admin operations
- `/api/analytics` - Analytics data
- `/api/notifications` - Notifications

## 🎨 UI Features

### Home Page
- 4 role cards (Admin, Doctor, Receptionist, Patient)
- Lucide React icons
- Gradient backgrounds
- Floating animations
- Features section
- Sign up button in footer

### Authentication Pages
- Beautiful gradient design
- Form validation
- Error messages with animations
- Loading states
- Password visibility toggle (Register)
- Links between login/register/home pages

### Sidebar Navigation
- Role-specific menu items
- Lucide React icons for each menu item
- Color-coded by role (Purple=Admin, Blue=Doctor, Green=Receptionist, Orange=Patient)
- Active route highlighting
- Floating animation on logo
- Logout button

## 🛠️ Development Tips

### Making API Calls
```javascript
import { authService } from '../services/AuthServices';

// Login
const result = await authService.login(email, password);

// Register
const result = await authService.register(userData);

// Get profile
const profile = await authService.getProfile();
```

### Using Auth Context
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, register, logout, isAuthenticated } = useAuth();
  
  // user object contains: _id, name, email, role, specialization, subscriptionPlan
  // isAuthenticated is boolean
}
```

### Adding Environment Variables
- Frontend: Create `.env` in root, accessible via `import.meta.env.VITE_*`
- Backend: Create `.env` in Backend/, accessible via `process.env.*`

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
- Check MongoDB URI in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure network connection

### Frontend can't reach backend
- Check VITE_API_URL in .env
- Ensure backend is running on port 5000
- Check CORS headers in server.js

### Login/Register not working
- Check browser console for errors
- Verify backend is running
- Check network tab in DevTools
- Verify JWT_SECRET in backend .env

### Icons not showing
- Ensure lucide-react is installed: `npm install lucide-react`
- Clear node_modules and reinstall if needed

## 📱 Test Accounts

Once registered, you can use:
- **Admin Role** - Manage system
- **Doctor Role** - Manage patients & appointments
- **Receptionist Role** - Register patients & book appointments  
- **Patient Role** - View appointments & prescriptions

## 🎯 Next Steps

1. ✅ Backend connected to MongoDB
2. ✅ Frontend routes configured
3. ✅ Authentication implemented
4. ✅ Register user feature added
5. ⏭️ Build dashboard pages
6. ⏭️ Implement appointments system
7. ⏭️ Add AI features (symptom checker)
8. ⏭️ Setup analytics

## 📚 Technologies Used

- **Frontend**: React 19, React Router 7, Vite, Tailwind CSS, Lucide React, Axios
- **Backend**: Express.js, MongoDB, Mongoose, JWT, Bcrypt
- **Styling**: CSS Modules, Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 🔗 Useful Commands

```bash
# Frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter

# Backend
npm install      # Install dependencies
npm run dev      # Start with nodemon
npm start        # Run server.js

# Check if servers are running
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/health
```

---

**Last Updated**: March 1, 2026
**Status**: ✅ Ready for Development
