import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  Building
} from 'lucide-react'
import api from '../utils/api'

const DashboardCompany = () => {
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
        api.get('/jobs/company'),
        api.get('/applications/company'),
        api.get('/interviews/company'),
        api.get('/profile/company')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Dashboard</h1>
          <p className="text-gray-600">Manage your job postings and find the perfect freelancers.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.filter(job => job.status === 'active').length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled Interviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.filter(int => int.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${profile?.totalSpent || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Active Job Postings</h2>
                <Link to="/job/post" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Link>
              </div>

              <div className="space-y-4">
                {jobs.filter(job => job.status === 'active').slice(0, 5).map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span className="text-sm text-gray-500">${job.budget}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{job.applicationsCount || 0} applications</span>
                        <span>{job.views || 0} views</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/job/${job._id}`}
                          className="btn-outline px-3 py-1 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        <Link
                          to={`/job/${job._id}/applications`}
                          className="btn-outline px-3 py-1 text-sm"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Applications ({job.applicationsCount || 0})
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {jobs.filter(job => job.status === 'active').length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active jobs yet</p>
                    <Link to="/job/post" className="btn-primary mt-4">
                      Post Your First Job
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <span className="font-medium">{profile?.rating || 0}/5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Jobs Posted</span>
                  <span className="font-medium">{profile?.totalJobsPosted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-medium">${profile?.totalSpent || 0}</span>
                </div>
              </div>
              <Link
                to="/company/setup"
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
                    <p className="text-xs text-gray-500 mt-1">by {application.freelancer?.name}</p>
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
                {applications.length === 0 && (
                  <p className="text-gray-500 text-sm">No applications yet</p>
                )}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
              <div className="space-y-3">
                {interviews.filter(int => int.status === 'scheduled').slice(0, 3).map((interview) => (
                  <div key={interview._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Interview with {interview.freelancer?.name}
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

export default DashboardCompany 