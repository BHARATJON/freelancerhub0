# 🚀 Freelancer Hub - Complete Full-Stack Platform

## 📋 Project Overview
A comprehensive freelancing platform built with modern technologies:
- **Backend**: Node.js + Express + MongoDB + Socket.io
- **Frontend**: React + Vite + Tailwind CSS + Zustand
- **Features**: Authentication, Job posting, Applications, Interviews, Payments, Reviews, Admin panel

## 🛠 Quick Start Guide

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
```bash
# Run both backend and frontend together
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## 🌐 Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🧪 Complete Postman Testing Guide

### Step 1: Register Users
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "freelancer"
}
```

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "TechCorp",
  "email": "tech@corp.com",
  "password": "password123",
  "role": "company"
}
```

### Step 2: Login and Get JWT Token
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Copy the JWT token from the response**

### Step 3: Set Authorization Header
Add to all subsequent requests:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Step 4: Create Profiles

#### Freelancer Profile
```http
POST http://localhost:5000/api/freelancer/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": "intermediate",
  "hourlyRate": 25,
  "bio": "Experienced full-stack developer with 3 years of experience",
  "location": "New York, USA",
  "availability": "full-time"
}
```

#### Company Profile
```http
POST http://localhost:5000/api/company/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "companyName": "TechCorp",
  "industry": "Technology",
  "description": "Leading tech company specializing in web development",
  "website": "https://techcorp.com",
  "location": "San Francisco, USA",
  "size": "51-200"
}
```

### Step 5: Post a Job
```http
POST http://localhost:5000/api/jobs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "React Developer Needed",
  "description": "Looking for an experienced React developer to build a modern web application",
  "requirements": ["React", "JavaScript", "CSS", "Git"],
  "skills": ["React", "JavaScript", "TypeScript"],
  "budget": 5000,
  "budgetType": "fixed",
  "duration": "2-4-weeks",
  "type": "project",
  "location": "Remote",
  "remote": true,
  "experienceLevel": "intermediate"
}
```

### Step 6: Browse Jobs
```http
GET http://localhost:5000/api/jobs
```

### Step 7: Apply for a Job
```http
POST http://localhost:5000/api/apply/JOB_ID_HERE
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "coverLetter": "I'm very interested in this React developer position. I have 3 years of experience with React and would love to contribute to your project.",
  "proposedRate": 30,
  "timeline": "3 weeks"
}
```

### Step 8: View Applications (Company)
```http
GET http://localhost:5000/api/jobs/JOB_ID/applications
Authorization: Bearer YOUR_JWT_TOKEN
```

### Step 9: Schedule Interview
```http
POST http://localhost:5000/api/interviews
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "applicationId": "APPLICATION_ID_HERE",
  "scheduledTime": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "notes": "Technical interview focusing on React skills"
}
```

### Step 10: Submit Work
```http
POST http://localhost:5000/api/submissions
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "jobId": "JOB_ID_HERE",
  "title": "React Application - Final Submission",
  "description": "Completed React application with all requested features",
  "files": [
    {
      "name": "project.zip",
      "url": "https://example.com/project.zip",
      "size": 1024000,
      "type": "application/zip"
    }
  ],
  "videoUrl": "https://youtube.com/watch?v=example"
}
```

### Step 11: Review and Rate
```http
POST http://localhost:5000/api/reviews
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "targetUserId": "USER_ID_HERE",
  "rating": 5,
  "comment": "Excellent work! Very professional and delivered on time.",
  "type": "company-to-freelancer"
}
```

### Step 12: File Complaint
```http
POST http://localhost:5000/api/complaints
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "targetUserId": "USER_ID_HERE",
  "title": "Payment Issue",
  "description": "Payment was not received as agreed",
  "type": "payment-issue",
  "category": "freelancer-issue"
}
```

## 📁 Complete Project Structure

```
freelancerhub0/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── FreelancerProfile.js
│   │   ├── CompanyProfile.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Interview.js
│   │   ├── Submission.js
│   │   ├── Transaction.js
│   │   ├── Review.js
│   │   ├── Complaint.js
│   │   └── Admin.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── JobCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ProfileSetupFreelancer.jsx
│   │   │   ├── ProfileSetupCompany.jsx
│   │   │   ├── DashboardFreelancer.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   └── [other pages...]
│   │   ├── stores/
│   │   │   └── authStore.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── package.json
├── README.md
├── SETUP_INSTRUCTIONS.md
└── COMPLETE_SETUP.md
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
2. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `PORT`
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend (Netlify)
1. Connect your GitHub repository
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/dist`
4. Set environment variables if needed

## 🔐 Security Features
- JWT Authentication with role-based access
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers

## 📱 Features Implemented
✅ User Authentication (Register/Login)  
✅ Role-based access (Freelancer/Company/Admin)  
✅ Profile creation and management  
✅ Job posting and browsing  
✅ Application system  
✅ Interview scheduling  
✅ Project submission  
✅ Payment system  
✅ Review and rating system  
✅ Complaint system  
✅ Admin panel  
✅ Real-time notifications  
✅ Responsive design  
✅ Modern UI with Tailwind CSS  

## 🐛 Troubleshooting

### Common Issues:
1. **Port already in use**: Change PORT in .env
2. **MongoDB connection failed**: Check MONGO_URI
3. **CORS errors**: Check frontend proxy configuration
4. **JWT errors**: Verify JWT_SECRET is set
5. **Module not found**: Run `npm install` in both backend and frontend

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
1. Test all API endpoints with Postman
2. Customize the UI/UX to match your brand
3. Add additional features like:
   - Real-time chat
   - File upload functionality
   - Payment gateway integration
   - Email notifications
   - Advanced search and filters
4. Set up monitoring and analytics
5. Deploy to production
6. Set up CI/CD pipeline

## 🎉 Congratulations!
You now have a complete, production-ready freelancing platform! The application includes all the essential features needed to run a successful freelancing marketplace. 