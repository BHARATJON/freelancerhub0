import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  Send,
  Star,
  Users,
  Globe
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../utils/api'

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedRate: '',
    timeline: ''
  })

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`)
      setJob(response.data)
    } catch (error) {
      toast.error('Failed to load job details')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setIsApplying(true)

    try {
      await api.post(`/applications/apply/${id}`, applicationData)
      toast.success('Application submitted successfully!')
      setShowApplyModal(false)
      navigate('/freelancer/dashboard')
    } catch (error) {
      toast.error('Failed to submit application')
    } finally {
      setIsApplying(false)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Job Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {job.duration}
                </span>
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${job.budget}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'active' ? 'bg-green-100 text-green-800' :
                job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.experienceLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                job.experienceLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {job.experienceLevel}
              </span>
            </div>
          </div>

          {/* Company Info */}
          {job.company && (
            <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-lg">
                  {job.company.name?.charAt(0) || job.company.companyName?.charAt(0) || 'C'}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-900">
                  {job.company.name || job.company.companyName}
                </h3>
                <p className="text-gray-600 text-sm">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {job.company.rating || 0}/5
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {user?.role === 'freelancer' && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="btn-primary"
              >
                <Send className="w-4 h-4 mr-2" />
                Apply for this Job
              </button>
            )}
            {user?.role === 'company' && job.company?._id === user.id && (
              <Link
                to={`/job/${job._id}/applications`}
                className="btn-outline"
              >
                <Users className="w-4 h-4 mr-2" />
                View Applications ({job.applicationsCount || 0})
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-semibold">${job.budget}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{job.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Job Type</span>
                  <span className="font-semibold capitalize">{job.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold capitalize">{job.experienceLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold">{job.location}</span>
                </div>
                {job.remote && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Remote</span>
                    <span className="font-semibold text-green-600">Yes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Details */}
            {job.company && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {job.company.size} employees
                    </span>
                  </div>
                  {job.company.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  {job.company.description && (
                    <p className="text-sm text-gray-600">
                      {job.company.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this Job</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={4}
                  className="input-field"
                  placeholder="Explain why you're the best fit for this job..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Rate ($/hr)
                </label>
                <input
                  type="number"
                  value={applicationData.proposedRate}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, proposedRate: e.target.value }))}
                  className="input-field"
                  placeholder="25"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <input
                  type="text"
                  value={applicationData.timeline}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, timeline: e.target.value }))}
                  className="input-field"
                  placeholder="2-4 weeks"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="btn-primary flex-1"
                >
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails