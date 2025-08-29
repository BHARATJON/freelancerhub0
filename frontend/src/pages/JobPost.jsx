import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Briefcase, DollarSign, MapPin, Clock, Plus, X } from 'lucide-react'
import api from '../utils/api'

const JobPost = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    skills: [''],
    budget: '',
    budgetType: 'fixed',
    duration: '',
    type: 'project',
    location: '',
    remote: false,
    experienceLevel: 'intermediate'
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? (typeof item === 'string' ? value : { ...item, [field]: value }) : item
      )
    }))
  }

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }))
  }

  const removeArrayItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Filter out empty requirements and skills
      const filteredRequirements = formData.requirements.filter(req => req.trim() !== '')
      const filteredSkills = formData.skills.filter(skill => skill.trim() !== '')
      
      const jobData = {
        ...formData,
        requirements: filteredRequirements,
        skills: filteredSkills,
        budget: parseInt(formData.budget)
      }

      await api.post('/jobs', jobData)
      toast.success('Job posted successfully!')
      navigate('/company/dashboard')
    } catch (error) {
      toast.error('Failed to post job. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Post a New Job
            </h1>
            <p className="text-gray-600">
              Find the perfect freelancer for your project
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Job Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., React Developer Needed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="project">Project</option>
                    <option value="hourly">Hourly</option>
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (₹) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="5000"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Type *
                  </label>
                  <select
                    name="budgetType"
                    value={formData.budgetType}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Duration</option>
                    <option value="less-than-1-week">Less than 1 week</option>
                    <option value="1-2-weeks">1-2 weeks</option>
                    <option value="2-4-weeks">2-4 weeks</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="more-than-6-months">More than 6 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.remote}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Remote work allowed
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="input-field"
                  placeholder="Describe the job requirements, responsibilities, and what you're looking for in a freelancer..."
                  maxLength={2000}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
              <div className="space-y-4">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayChange(index, 'requirement', e.target.value, 'requirements')}
                      className="input-field flex-1"
                      placeholder="e.g., 3+ years of experience with React"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'requirements')}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Required Skills</h2>
              <div className="space-y-4">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange(index, 'skill', e.target.value, 'skills')}
                      className="input-field flex-1"
                      placeholder="e.g., React, JavaScript, Node.js"
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'skills')}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('skills')}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary px-8 py-3"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Job...
                  </div>
                ) : (
                  'Post Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JobPost 