# 🚀 Freelancer Hub - Complete Setup Guide

## 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (already configured)

## 🛠 Installation Steps

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Environment Setup

Create `.env` file in the `backend` folder:
```env
MONGO_URI=mongodb+srv://jonsurana8:jonsurana10012005@cluster0.13jq2ku.mongodb.net/freelancerhub
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=test@example.com
EMAIL_PASS=app-password
PORT=5000
NODE_ENV=development
```

### 3. Run the Application

#### Option A: Run Both Backend and Frontend Together
```bash
npm run dev
```

#### Option B: Run Separately
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

## 🌐 Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: See README.md for all endpoints

## 🧪 Testing with Postman

### 1. Register a User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "freelancer"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Copy the JWT token from the response**

### 3. Set Authorization Header
Add to all subsequent requests:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Create Freelancer Profile
```
POST http://localhost:5000/api/freelancer/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": "intermediate",
  "bio": "Experienced full-stack developer",
  "location": "New York, USA",
}
```

### 5. Create Company Profile
```
POST http://localhost:5000/api/company/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "companyName": "TechCorp",
  "industry": "Technology",
  "description": "Leading tech company",
  "website": "https://techcorp.com",
  "location": "San Francisco, USA",
  "size": "51-200"
}
```

### 6. Post a Job
```
POST http://localhost:5000/api/jobs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "React Developer Needed",
  "description": "Looking for an experienced React developer",
  "requirements": ["React", "JavaScript", "CSS"],
  "skills": ["React", "JavaScript"],
  "budget": 5000,
  "budgetType": "fixed",
  "duration": "2-4-weeks",
  "type": "project",
  "location": "Remote",
  "remote": true,
  "experienceLevel": "intermediate"
}
```

### 7. Apply for a Job
```
POST http://localhost:5000/api/apply/JOB_ID_HERE
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "coverLetter": "I'm interested in this position",
  "proposedRate": 30,
  "timeline": "2 weeks"
}
```

## 📁 Project Structure

```
freelancerhub0/
├── backend/
│   ├── models/           # Mongoose models
│   ├── middleware/       # Auth & role middleware
│   ├── server.js         # Main server file
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand stores
│   │   ├── utils/        # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Run both backend and frontend
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `npm run install-all` - Install all dependencies
- `npm run build` - Build frontend for production

### Backend
- `npm run dev` - Run with nodemon
- `npm start` - Run production server

### Frontend
- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Frontend (Netlify)
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

## 🔐 Security Notes
- Change JWT_SECRET in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set up proper CORS configuration

## 🐛 Troubleshooting

### Common Issues:
1. **Port already in use**: Change PORT in .env
2. **MongoDB connection failed**: Check MONGO_URI
3. **CORS errors**: Check frontend proxy configuration
4. **JWT errors**: Verify JWT_SECRET is set

### Debug Mode:
```bash
# Backend with debug logging
DEBUG=* npm run dev

# Frontend with detailed errors
npm run dev -- --debug
```

## 📞 Support
- Check the README.md for API documentation
- Review the code comments for implementation details
- Test all endpoints with Postman before proceeding

## ✅ Next Steps
1. Test all API endpoints
2. Customize the UI/UX
3. Add additional features
4. Set up email notifications
5. Implement payment processing
6. Add real-time chat
7. Deploy to production 