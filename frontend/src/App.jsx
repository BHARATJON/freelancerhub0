import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileSetupFreelancer from './pages/ProfileSetupFreelancer'
import ProfileSetupCompany from './pages/ProfileSetupCompany'
import DashboardFreelancer from './pages/DashboardFreelancer'
import DashboardCompany from './pages/DashboardCompany'
import JobDetails from './pages/JobDetails'
import JobPost from './pages/JobPost'
import Submission from './pages/Submission'
import Review from './pages/Review'
import Complaint from './pages/Complaint'
import AdminComplaints from './pages/AdminComplaints'
import ApplicationDetails from './pages/ApplicationDetails'
import JobApplications from './pages/JobApplications'
import InterviewRoom from './pages/InterviewRoom'
import ScheduledInterviews from './pages/ScheduledInterviews'
import ProtectedRoute from './components/ProtectedRoute'
import Payment from './pages/Payment';
import TransactionHistory from './pages/TransactionHistory';
import { useEffect } from 'react' // Import useEffect

function App() {
  const { user, isAuthenticated, init } = useAuthStore() // Destructure init from useAuthStore

  useEffect(() => {
    init(); // Call init when the component mounts
  }, [init]); // Add init to the dependency array

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/freelancer/setup" element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <ProfileSetupFreelancer />
            </ProtectedRoute>
          } />
          
          <Route path="/company/setup" element={
            <ProtectedRoute allowedRoles={['company']}>
              <ProfileSetupCompany />
            </ProtectedRoute>
          } />
          
          <Route path="/freelancer/dashboard" element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <DashboardFreelancer />
            </ProtectedRoute>
          } />
          
          <Route path="/company/dashboard" element={
            <ProtectedRoute allowedRoles={['company']}>
              <DashboardCompany />
            </ProtectedRoute>
          } />
          
          <Route path="/job/:id" element={<JobDetails />} />
          
          <Route path="/job/post" element={
            <ProtectedRoute allowedRoles={['company']}>
              <JobPost />
            </ProtectedRoute>
          } />
          
          <Route path="/project/:id" element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <Submission />
            </ProtectedRoute>
          } />
          
          <Route path="/review/:userId" element={
            <ProtectedRoute allowedRoles={['freelancer', 'company']}>
              <Review />
            </ProtectedRoute>
          } />
          
          <Route path="/complaints" element={
            <ProtectedRoute allowedRoles={['freelancer', 'company']}>
              <Complaint />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/complaints" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminComplaints />
            </ProtectedRoute>
          } />
          
          <Route path="/application/:id" element={
            <ProtectedRoute allowedRoles={['freelancer', 'company']}>
              <ApplicationDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/job/:jobId/applications" element={
            <ProtectedRoute allowedRoles={['company']}>
              <JobApplications />
            </ProtectedRoute>
          } />
          
          <Route path="/interview/:interviewId" element={
            <ProtectedRoute allowedRoles={['freelancer', 'company']}>
              <InterviewRoom />
            </ProtectedRoute>
          } />

          <Route path="/scheduled-interviews" element={
            <ProtectedRoute allowedRoles={['freelancer', 'company']}>
              <ScheduledInterviews />
            </ProtectedRoute>
          } />

          <Route path="/payments" element={
            <ProtectedRoute allowedRoles={['freelancer', 'company']}>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['freelancer', 'company']}>
              <TransactionHistory />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App