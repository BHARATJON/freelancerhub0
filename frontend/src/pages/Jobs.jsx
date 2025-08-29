
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import { useAuthStore } from '../stores/authStore';


const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        let jobsData = response.data;
        // If user is a company, filter jobs to only those posted by this company
        if (user?.role === 'company') {
          jobsData = jobsData.filter(job => {
            // job.company could be an object or an id, handle both
            if (!job.company) return false;
            if (typeof job.company === 'object') {
              return job.company._id === user.id;
            }
            return job.company === user.id;
          });
        }
        setJobs(jobsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Jobs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default Jobs;