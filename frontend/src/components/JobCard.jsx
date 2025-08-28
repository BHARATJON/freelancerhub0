import { Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign, Calendar, Briefcase } from 'lucide-react'

const JobCard = ({ job, onApply, showApplyButton = true }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getExperienceColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'expert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card-hover">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link to={`/job/${job._id}`} className="hover:text-primary-600 transition-colors">
              {job.title}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {job.description}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getExperienceColor(job.experienceLevel)}`}>
            {job.experienceLevel}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs text-gray-500">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>${job.budget}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{job.duration}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{job.type}</span>
          </div>
        </div>

        {/* Company Info */}
        {job.company && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {job.company.name?.charAt(0) || 'C'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {job.company.name || job.company.companyName}
                </p>
                <p className="text-xs text-gray-500">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Link
            to={`/job/${job._id}`}
            className="btn-outline flex-1 text-center"
          >
            View Details
          </Link>
          {showApplyButton && onApply && (
            <button
              onClick={() => onApply(job._id)}
              className="btn-primary flex-1"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobCard 