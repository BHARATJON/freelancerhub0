import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { User, MapPin, IndianRupee, Calendar, Briefcase, Plus, X } from 'lucide-react'
import api from '../utils/api'

const ProfileSetupFreelancer = () => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    skills: [''],
    experience: 'beginner',
    bio: '',
    location: '',
    upi_id: '',
    education: [{ degree: '', institution: '', year: '' }],
    certifications: [{ name: '', issuer: '', year: '', link: '' }],
    languages: [{ language: '', proficiency: 'conversational' }]
  })

  // (Removed duplicate addSkill)

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }))
  }

  const removeArrayItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }))
  }

  const handleSkillsChange = (index, value) => {
    const newSkills = [...formData.skills]
    newSkills[index] = value
    setFormData(prev => ({ ...prev, skills: newSkills }))
  }

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Filter out empty skills
      const filteredSkills = formData.skills.filter(skill => skill.trim() !== '');
      const profileData = {
        ...formData,
        skills: filteredSkills
      };
      await api.post('/profile/freelancer', profileData);
      toast.success('Profile created successfully!');
      navigate('/freelancer/dashboard');
    } catch (error) {
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Freelancer Profile
            </h1>
            <p className="text-gray-600">
              Tell clients about your skills, experience, and what makes you unique
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="expert">Expert (5+ years)</option>
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
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="upi_id"
                    value={formData.upi_id}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="your-upi@bank"
                    required
                  />
                </div>
              </div>
              {/* Availability removed. Add bio field below. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Tell clients about yourself, your experience, and what you can offer..."
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/1000 characters
                </p>
              </div>

            {/* Skills */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Skills
              </h2>

              <div className="space-y-4">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillsChange(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="e.g., React, Node.js, Python"
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </button>
              </div>
            </div>

            {/* Education */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Education</h2>
              {formData.education.map((edu, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')}
                    className="input-field"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleArrayChange(index, 'institution', e.target.value, 'education')}
                    className="input-field"
                    placeholder="Institution"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={edu.year}
                      onChange={(e) => handleArrayChange(index, 'year', e.target.value, 'education')}
                      className="input-field"
                      placeholder="Year"
                      min="1900"
                      max="2030"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'education')}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('education', { degree: '', institution: '', year: '' })}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Education
              </button>
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
                    Creating Profile...
                  </div>
                ) : (
                  'Create Profile'
                )}
              </button>
            </div>
          </div> {/* Close the last opened div for form sections */}
          </form>
        </div>
      </div>
    </div>
  )
  }

export default ProfileSetupFreelancer;