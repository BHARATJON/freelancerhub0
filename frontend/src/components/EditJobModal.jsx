import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Briefcase, IndianRupee, Clock, Plus, X } from 'lucide-react';
import api from '../utils/api';

const EditJobModal = ({ jobId, onClose, onJobUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setFormData(response.data);
      } catch (error) {
        toast.error('Failed to load job details');
        onClose();
      }
    };
    fetchJobDetails();
  }, [jobId, onClose]);

  useEffect(() => {
    if (formData) {
        const numModels = parseInt(formData.numberOfModels, 10);
        if (!isNaN(numModels) && numModels >= 0) {
          const newModels = Array.from({ length: numModels }, (_, i) => {
            return formData.models[i] || { modelName: '', modelDescription: '', modelWeightage: '' };
          });
          setFormData(prev => ({ ...prev, models: newModels }));
        } else {
          setFormData(prev => ({ ...prev, models: [] }));
        }
    }
  }, [formData?.numberOfModels]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? (typeof item === 'string' ? value : { ...item, [field]: value }) : item
      ),
    }));
  };

  const handleModelChange = (index, field, value) => {
    const newModels = [...formData.models];
    newModels[index][field] = value;
    setFormData(prev => ({ ...prev, models: newModels }));
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ''],
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
      const filteredSkills = formData.skills.filter(skill => skill.trim() !== '');

      const jobData = {
        ...formData,
        requirements: filteredRequirements,
        skills: filteredSkills,
        budget: parseInt(formData.budget),
      };

      await api.put(`/jobs/${jobId}`, jobData);
      toast.success('Job updated successfully!');
      onJobUpdated();
      onClose();
    } catch (error) {
      toast.error('Failed to update job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 overflow-y-auto max-h-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Job
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                    Budget (₹) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-gray-400" />
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

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Models</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Models
                </label>
                <input
                  type="number"
                  name="numberOfModels"
                  value={formData.numberOfModels}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 2"
                  min="0"
                />
              </div>

              {formData.models.map((model, index) => (
                <div key={index} className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900">Model {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        value={model.modelName}
                        onChange={(e) => handleModelChange(index, 'modelName', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Frontend"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Weightage (%) *
                      </label>
                      <input
                        type="number"
                        value={model.modelWeightage}
                        onChange={(e) => handleModelChange(index, 'modelWeightage', e.target.value)}
                        className="input-field"
                        placeholder="e.g., 50"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Description *
                    </label>
                    <textarea
                      value={model.modelDescription}
                      onChange={(e) => handleModelChange(index, 'modelDescription', e.target.value)}
                      rows={3}
                      className="input-field"
                      placeholder="Describe the model..."
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary px-8 py-3 mr-4"
                >
                    Cancel
                </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary px-8 py-3"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Job...
                  </div>
                ) : (
                  'Update Job'
                )}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default EditJobModal;
