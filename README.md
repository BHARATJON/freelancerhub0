# 🚀 Freelancer Hub - Full Stack Platform

A complete freelancing platform built with React, Node.js, and MongoDB.

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** with Mongoose ODM
- **JWT** Authentication
- **Socket.io** for real-time features
- **Multer** for file uploads
- **Nodemailer** for email notifications

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Toastify** for notifications
- **Zustand** for state management

## 📦 Installation & Setup

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Environment Variables

Create `.env` file in the backend folder:
```env
MONGO_URI=mongodb+srv://jonsurana8:jonsurana10012005@cluster0.13jq2ku.mongodb.net/
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=test@example.com
EMAIL_PASS=app-password
PORT=5000
```

### 3. Run Development Servers
```bash
# Run both backend and frontend
npm run dev

# Or run separately:
npm run server  # Backend on port 5000
npm run client  # Frontend on port 5173
```

## 🧪 Testing with Postman

### Authentication
1. **Register**: `POST http://localhost:5000/api/auth/register`
2. **Login**: `POST http://localhost:5000/api/auth/login` (copy JWT token)
3. **Add Authorization**: Bearer Token with your JWT

### Profile Setup
4. **Freelancer Profile**: `POST http://localhost:5000/api/freelancer/profile`
5. **Company Profile**: `POST http://localhost:5000/api/company/profile`

### Jobs & Applications
6. **Post Job**: `POST http://localhost:5000/api/jobs`
7. **Apply for Job**: `POST http://localhost:5000/api/apply/:jobId`
8. **View Applications**: `GET http://localhost:5000/api/jobs/:id/applications`

## 🏗 Project Structure

```
freelancerhub0/
├── backend/           # Node.js + Express server
├── frontend/          # React + Vite app
├── package.json       # Root package.json
└── README.md         # This file
```

## 🚀 Deployment

- **Backend**: Deploy to Render
- **Frontend**: Deploy to Netlify
- **Database**: MongoDB Atlas (already configured)

## 📱 Features

- ✅ User Authentication (Freelancer/Company/Admin)
- ✅ Profile Management
- ✅ Job Posting & Browsing
- ✅ Application System
- ✅ Interview Scheduling
- ✅ Project Submission
- ✅ Payment System
- ✅ Review & Rating
- ✅ Complaint System
- ✅ Admin Panel
- ✅ Real-time Notifications

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profiles
- `POST /api/freelancer/profile` - Create freelancer profile
- `PUT /api/freelancer/profile` - Update freelancer profile
- `POST /api/company/profile` - Create company profile
- `PUT /api/company/profile` - Update company profile

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/apply/:jobId` - Apply for job
- `GET /api/applications` - Get user applications
- `PUT /api/application/status/:id` - Update application status

### Interviews
- `POST /api/interviews` - Schedule interview
- `GET /api/interviews` - Get interviews
- `PUT /api/interviews/:id` - Update interview

### Submissions
- `POST /api/submissions` - Submit work
- `GET /api/submissions` - Get submissions
- `PUT /api/submissions/:id` - Update submission

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/:userId` - Get user reviews

### Complaints
- `POST /api/complaints` - File complaint
- `GET /api/complaints` - Get complaints (admin)
- `PUT /api/complaints/:id` - Resolve complaint (admin) 