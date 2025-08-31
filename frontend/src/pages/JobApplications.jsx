import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  ArrowLeft,
  User,
  Calendar,
  IndianRupee,
  Eye,
  Filter,
  Search,
  Briefcase,
  Star
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../utils/api'

const JobApplications = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [applications, setApplications] = useState([])
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchJobAndApplications()
  }, [jobId])

  const fetchJobAndApplications = async () => {
    try {
      const [jobRes, applicationsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/jobs/${jobId}/applications`)
      ])
      
      setJob(jobRes.data)
      setApplications(applicationsRes.data)
    } catch (error) {
      toast.error('Failed to load job applications')
      navigate('/company/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = searchTerm === '' || 
      app.freelancer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.freelancerProfile?.skills?.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-purple-100 text-purple-800'
      case 'interviewed': return 'bg-indigo-100 text-indigo-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600">The job you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/company/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Applications for {job.title}
              </h1>
              <p className="text-gray-600">
                {applications.length} application{applications.length !== 1 ? 's' : ''} received
              </p>
            </div>
            <Link
              to={`/job/${jobId}`}
              className="btn-outline"
            >
              View Job Details
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by freelancer name or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="card text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500">
                {applications.length === 0 
                  ? "No applications have been submitted for this job yet."
                  : "No applications match your current filters."
                }
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application._id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {application.freelancer?.name}
                          </h3>
                          <p className="text-sm text-gray-500">{application.freelancer?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        <Link
                          to={`/application/${application._id}`}
                          className="btn-outline px-3 py-1 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Removed Proposed Rate and Timeline */}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Applied</p>
                          <p className="font-medium">
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {application.freelancerProfile && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Freelancer Profile</h4>
                          {application.freelancerProfile.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm font-medium">
                                {application.freelancerProfile.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Experience</p>
                            <p className="text-sm font-medium">
                              {application.freelancerProfile.experience} years
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Hourly Rate</p>
                            <p className="text-sm font-medium">

                            </p>
                          </div>
                        </div>
                        {application.freelancerProfile.skills && application.freelancerProfile.skills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {application.freelancerProfile.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {application.freelancerProfile.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  +{application.freelancerProfile.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter Preview</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {application.coverLetter}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {applications.length > 0 && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {applications.filter(app => app.status === 'reviewed').length}
                </p>
                <p className="text-sm text-gray-500">Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {applications.filter(app => app.status === 'shortlisted').length}
                </p>
                <p className="text-sm text-gray-500">Shortlisted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'hired').length}
                </p>
                <p className="text-sm text-gray-500">Hired</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter(app => app.status === 'rejected').length}
                </p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobApplications 