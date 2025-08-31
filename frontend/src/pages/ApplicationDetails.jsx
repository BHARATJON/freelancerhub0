import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  ArrowLeft,
  Calendar,
  IndianRupee,
  Clock,
  User,
  Mail,
  Star,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../utils/api'

const ApplicationDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [application, setApplication] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [interviewData, setInterviewData] = useState({
    scheduledTime: '',
    duration: 30,
    notes: '',
    interviewType: 'video'
  })

  useEffect(() => {
    fetchApplicationDetails()
  }, [id])

  const fetchApplicationDetails = async () => {
    try {
      const response = await api.get(`/applications/${id}`)
      setApplication(response.data)
    } catch (error) {
      toast.error('Failed to load application details')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setIsUpdatingStatus(true)

    try {
      const updateData = { status: newStatus }
      if (newStatus === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason
      }

      await api.put(`/applications/status/${id}`, updateData)
      toast.success('Application status updated successfully!')
      setShowStatusModal(false)
      fetchApplicationDetails() // Refresh the data
    } catch (error) {
      toast.error('Failed to update application status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    setIsUpdatingStatus(true)

    try {
      await api.post('/interviews', {
        applicationId: id,
        ...interviewData
      })
      toast.success('Interview scheduled successfully!')
      setShowInterviewModal(false)
      fetchApplicationDetails() // Refresh the data
    } catch (error) {
      toast.error('Failed to schedule interview')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hired': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'shortlisted': return <Star className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600">The application you're looking for doesn't exist.</p>
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
            to={user.role === 'company' ? '/company/dashboard' : '/freelancer/dashboard'}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application for {application.job?.title}
              </h1>
              <p className="text-gray-600">
                Applied by {application.freelancer?.name} on{' '}
                {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            {user.role === 'company' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="btn-primary"
                >
                  Update Status
                </button>
                {application.status === 'shortlisted' && (
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="btn-outline"
                  >
                    Schedule Interview
                  </button>
                )}
                {application.status === 'interviewed' && application.interview?._id && (
                  <Link
                    to={`/interview/${application.interview._id}`}
                    className="btn-outline"
                  >
                    Join Interview
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span className="ml-1 capitalize">{application.status}</span>
                </span>
              </div>
              {application.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-2">Rejection Reason:</h3>
                  <p className="text-red-700">{application.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cover Letter</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>

            {/* Application Details */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
        {/* Removed Proposed Rate and Timeline */}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Applied On</p>
                      <p className="font-medium">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {application.reviewedAt && (
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Reviewed On</p>
                        <p className="font-medium">
                          {new Date(application.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Portfolio */}
      {/* Removed Portfolio section */}

            {/* Attachments */}
      {/* Removed Attachments section */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Freelancer Profile */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Freelancer Profile</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{application.freelancer?.name}</p>
                    <p className="text-sm text-gray-500">{application.freelancer?.email}</p>
                  </div>
                </div>
                
                {application.freelancerProfile && (
                  <>
                    <div className="flex items-center">
                      <IndianRupee className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Hourly Rate</p>

                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-medium">{application.freelancerProfile.experience} years</p>
                      </div>
                    </div>

                    {application.freelancerProfile.skills && application.freelancerProfile.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {application.freelancerProfile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.freelancerProfile.bio && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Bio</p>
                        <p className="text-sm text-gray-700">{application.freelancerProfile.bio}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Job Title</p>
                  <p className="font-medium">{application.job?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium">₹{application.job?.budget}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{application.job?.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{application.job?.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Application Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {newStatus === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Provide feedback to the freelancer..."
                  />
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="btn-primary flex-1"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Interview</h2>
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={interviewData.scheduledTime}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={interviewData.duration}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type
                </label>
                <select
                  value={interviewData.interviewType}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, interviewType: e.target.value }))}
                  className="input-field"
                >
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Call</option>
                  <option value="text">Text Chat</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="input-field"
                  placeholder="Any specific instructions or topics to discuss..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="btn-primary flex-1"
                >
                  {isUpdatingStatus ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationDetails 