import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('active');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let response;
      if (user?.role === 'company') {
        response = await api.get(`/jobs/company?status=${activeTab}`);
      } else if (user?.role === 'freelancer') {
        if (activeTab === 'active') {
          response = await api.get(`/jobs?status=active`);
        } else {
          response = await api.get(`/jobs/my-jobs?status=${activeTab}`);
        }
      } else {
        response = await api.get('/jobs?status=active');
      }
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user, activeTab]);

  const handleCompleteJob = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/complete`);
      toast.success('Job marked as completed!');
      fetchJobs(); // Refresh the jobs list
    } catch (error) {
      toast.error('Failed to mark job as completed');
    }
  };

  const renderTabs = () => {
    if (user?.role === 'company') {
      return (
        <div className="flex space-x-4 border-b mb-8">
          <button onClick={() => setActiveTab('active')} className={`py-2 px-4 ${activeTab === 'active' ? 'border-b-2 border-primary-600 font-semibold' : ''}`}>Active Jobs</button>
          <button onClick={() => setActiveTab('in-progress')} className={`py-2 px-4 ${activeTab === 'in-progress' ? 'border-b-2 border-primary-600 font-semibold' : ''}`}>In Progress</button>
          <button onClick={() => setActiveTab('completed')} className={`py-2 px-4 ${activeTab === 'completed' ? 'border-b-2 border-primary-600 font-semibold' : ''}`}>Completed</button>
        </div>
      );
    } else if (user?.role === 'freelancer') {
      return (
        <div className="flex space-x-4 border-b mb-8">
          <button onClick={() => setActiveTab('active')} className={`py-2 px-4 ${activeTab === 'active' ? 'border-b-2 border-primary-600 font-semibold' : ''}`}>Open Jobs</button>
          <button onClick={() => setActiveTab('in-progress')} className={`py-2 px-4 ${activeTab === 'in-progress' ? 'border-b-2 border-primary-600 font-semibold' : ''}`}>My In Progress Jobs</button>
          <button onClick={() => setActiveTab('completed')} className={`py-2 px-4 ${activeTab === 'completed' ? 'border-b-2 border-primary-600 font-semibold' : ''}`}>My Completed Jobs</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Jobs</h1>
      {renderTabs()}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onComplete={handleCompleteJob}
                showChatButton={activeTab === 'in-progress' || activeTab === 'completed'}
              />
            ))
          ) : (
            <p>No jobs found for this category.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs;
