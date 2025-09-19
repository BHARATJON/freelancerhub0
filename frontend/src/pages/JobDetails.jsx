import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Briefcase, 
  Send,
  Star,
  Users,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: ''
  });
  const [applications, setApplications] = useState([]);
  const [applicants, setApplicants] = useState([]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/');
    }
  };

  const fetchFreelancerApplications = async () => {
    if (user?.role === 'freelancer') {
      try {
        const response = await api.get('/applications');
        setApplications(response.data);
      } catch (error) {
        console.error('Failed to load applications', error);
      }
    }
  };

  const fetchJobApplicants = async () => {
    if (user?.role === 'company' && job && user.id === job.company._id) {
      try {
        const response = await api.get(`/jobs/${id}/applications`);
        setApplicants(response.data);
      } catch (error) {
        console.error('Failed to load applicants', error);
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchJobDetails();
    if (user?.role === 'freelancer') {
      fetchFreelancerApplications();
    }
    setIsLoading(false);
  }, [id, user]);

  useEffect(() => {
    if (job) {
      fetchJobApplicants();
    }
  }, [job, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);

    try {
      await api.post(`/applications/apply/${id}`, applicationData);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      fetchFreelancerApplications(); // Refresh applications
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading || !job) {
    return <div>Loading...</div>;
  }

  const hasApplied = applications.some(app => app.job?._id === id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="flex items-center mr-4">
              <Briefcase className="w-4 h-4 mr-1" />
              {job.company.name}
            </span>
            <span className="flex items-center mr-4">
              <MapPin className="w-4 h-4 mr-1" />
              Remote
            </span>
            <span className="flex items-center mr-4">
              <Clock className="w-4 h-4 mr-1" />
              Project
            </span>
            <span className="flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" />
              ₹{`${job.budget}`} (Fixed)
            </span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Job Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">{skill}</span>
              ))}
            </div>
          </div>

          {job.models && job.models.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Models</h3>
              <div className="space-y-4">
                {job.models.map((model, index) => (
                  <div key={index} className="border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-800">Model {index + 1}: {model.modelName}</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{model.modelDescription}</p>
                    <p className="text-gray-600">Weightage: {model.modelWeightage}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-200 pt-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Details</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  <span>Duration: <strong>{job.duration.replace(/-/g, ' ')}</strong></span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-primary-500" />
                  <span>Experience: <strong>{job.experienceLevel}</strong></span>
                </div>
                {job.deadline && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                    <span>Deadline: <strong>{new Date(job.deadline).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">About the Company</h3>
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <Globe className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{job.company.name}</p>
                        <p className="text-sm text-gray-500">{job.company.email}</p>
                    </div>
                </div>
            </div>
          </div>
          {user?.role === 'freelancer' && job.status === 'active' && !hasApplied && (
            <button onClick={() => setShowApplyModal(true)} className="btn-primary mt-4">
              <Send className="w-4 h-4 mr-2" />
              Apply for this Job
            </button>
          )}
           {user?.role === 'freelancer' && hasApplied && (
            <p className="text-green-600 font-semibold mt-4">You have already applied for this job.</p>
          )}
        </div>

        {user?.role === 'company' && user.id === job.company._id && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Applicants</h2>
            {applicants.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {applicants.map(applicant => (
                  <li key={applicant._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{applicant.freelancer.name}</p>
                      <p className="text-sm text-gray-500">{applicant.freelancer.email}</p>
                    </div>
                    <Link to={`/application/${applicant._id}`} className="btn-outline text-sm">View Application</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No applicants yet.</p>
            )}
          </div>
        )}

        {(job.status === 'in-progress' || job.status === 'completed') && job.hiredFreelancer && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Freelancer</h2>
            <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">{job.hiredFreelancer.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                    <p className="font-medium">{job.hiredFreelancer.name}</p>
                    <p className="text-sm text-gray-500">{job.hiredFreelancer.email}</p>
                </div>
            </div>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this Job</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                  <textarea value={applicationData.coverLetter} onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))} rows={4} className="input-field" required />
                </div>
                {/* Removed Proposed Rate and Timeline fields */}
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={isApplying} className="btn-primary flex-1">{isApplying ? 'Submitting...' : 'Submit Application'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;