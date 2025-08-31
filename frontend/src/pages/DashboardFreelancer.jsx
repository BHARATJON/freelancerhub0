import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  Briefcase, 
  Clock, 
  IndianRupee, 
  Star, 
  Eye, 
  Send,
  Calendar,
  TrendingUp,
  Award,
  MapPin
} from 'lucide-react'
import api from '../utils/api'

const DashboardFreelancer = () => {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, applicationsRes, interviewsRes, profileRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/applications'),
        api.get('/interviews'),
        api.get('/profile/freelancer')
      ])

      setJobs(jobsRes.data)
      setApplications(applicationsRes.data)
      setInterviews(interviewsRes.data)
      setProfile(profileRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async (jobId) => {
    try {
      await api.post(`/applications/apply/${jobId}`, {
        coverLetter: 'I am interested in this position and would like to apply.',
  proposedRate: profile?.totalEarnings || 0,
        timeline: '2-4 weeks'
      })
      toast.success('Application submitted successfully!')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to submit application')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Freelancer Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your freelance career.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs Applied</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Interviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.filter(int => int.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hourly Rate</p>
                <p className="text-2xl font-bold text-gray-900">₹{profile?.totalEarnings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommended Jobs */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
                <Link to="/jobs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span className="text-sm text-gray-500">₹{job.budget}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {job.duration}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/job/${job._id}`}
                          className="btn-outline px-3 py-1 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        <button
                          onClick={() => handleApply(job._id)}
                          className="btn-primary px-3 py-1 text-sm"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{profile?.rating || 0}/5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Jobs</span>
                  <span className="font-medium">{profile?.completedJobs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-medium">₹{profile?.totalEarnings || 0}</span>
                </div>
              </div>
              <Link
                to="/freelancer/setup"
                className="btn-outline w-full mt-4"
              >
                Edit Profile
              </Link>
            </div>

            {/* Recent Applications */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
              <div className="space-y-3">
                {applications.slice(0, 3).map((application) => (
                  <div key={application._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{application.job?.title}</h4>
                      <Link
                        to={`/application/${application._id}`}
                        className="text-primary-600 hover:text-primary-700 text-xs"
                      >
                        <Eye className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'hired' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
              <div className="space-y-3">
                {interviews.filter(int => int.status === 'scheduled').slice(0, 3).map((interview) => (
                  <div key={interview._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Interview with {interview.company?.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(interview.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                ))}
                {interviews.filter(int => int.status === 'scheduled').length === 0 && (
                  <p className="text-gray-500 text-sm">No upcoming interviews</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardFreelancer