import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { api } from "../services/api";

const JobContext = createContext(null);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all jobs
  const fetchJobs = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const data = await api.jobs.list(filters);
        setJobs(data);
        return { success: true, jobs: data };
      } catch (error) {
        console.error('Fetch jobs error:', error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch single job
  const fetchJob = useCallback(
    async (jobId) => {
      setLoading(true);
      try {
        const data = await api.jobs.get(jobId);
        setCurrentJob(data);
        return { success: true, job: data };
      } catch (error) {
        console.error('Fetch job error:', error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Create job
  const createJob = useCallback(async (jobData) => {
    setLoading(true);
    try {
      const data = await api.jobs.create(jobData);
      setJobs(prev => [data, ...prev]);
      return { success: true, job: data };
    } catch (error) {
      console.error('Create job error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update job
  const updateJob = useCallback(
    async (jobId, updates) => {
      setLoading(true);
      try {
        const data = await api.jobs.update(jobId, updates);
        setJobs(prev => prev.map(job => (job._id === jobId || job.id === jobId) ? data : job));
        if (currentJob?._id === jobId || currentJob?.id === jobId) setCurrentJob(data);
        return { success: true, job: data };
      } catch (error) {
        console.error('Update job error:', error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [currentJob],
  );

  // Apply to job
  const applyToJob = useCallback(async (jobId, file) => {
    setLoading(true);
    try {
      const data = await api.applications.apply(jobId, file);
      return { success: true, application: data };
    } catch (error) {
      console.error('Apply error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    jobs,
    currentJob,
    loading,
    fetchJobs,
    fetchJob,
    createJob,
    updateJob,
    applyToJob,
    setCurrentJob,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJob must be used within JobProvider");
  }
  return context;
};
