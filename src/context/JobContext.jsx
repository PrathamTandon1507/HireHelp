import { createContext, useContext, useState, useCallback } from "react";

const JobContext = createContext(null);

// Mock data generator
const generateMockJobs = () => [
  {
    _id: "1",
    title: "Senior Backend Engineer",
    department: "Engineering",
    description:
      "We are looking for an experienced backend engineer to join our growing team and help build scalable systems.",
    location: "San Francisco, CA",
    type: "Full-time",
    status: "active",
    applicants: 45,
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    _id: "2",
    title: "Product Designer",
    department: "Design",
    description:
      "Join our design team to create beautiful and functional user experiences for our products.",
    location: "Remote",
    type: "Full-time",
    status: "active",
    applicants: 32,
    createdAt: "2026-01-12T00:00:00Z",
  },
  {
    _id: "3",
    title: "Data Scientist",
    department: "Data & Analytics",
    description:
      "Help us unlock insights from our data to drive business decisions and product improvements.",
    location: "New York, NY",
    type: "Full-time",
    status: "active",
    applicants: 28,
    createdAt: "2026-01-15T00:00:00Z",
  },
];

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all jobs
  const fetchJobs = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      // TODO: Uncomment when backend is ready
      // const queryParams = new URLSearchParams(filters).toString();
      // const response = await fetch(`/api/jobs?${queryParams}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('hirehelp_token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      // if (! response.ok) throw new Error('Failed to fetch jobs');

      // const data = await response.json();
      // setJobs(data. jobs);
      // return { success: true, jobs: data.jobs };

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      const mockJobs = generateMockJobs();
      setJobs(mockJobs);
      return { success: true, jobs: mockJobs };
    } catch (error) {
      console.error("Fetch jobs error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single job
  const fetchJob = useCallback(async (jobId) => {
    setLoading(true);
    try {
      // TODO: Uncomment when backend is ready
      // const response = await fetch(`/api/jobs/${jobId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('hirehelp_token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      // if (!response.ok) throw new Error('Failed to fetch job');

      // const data = await response.json();
      // setCurrentJob(data. job);
      // return { success: true, job: data.job };

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 300));
      const mockJobs = generateMockJobs();
      const job = mockJobs.find((j) => j._id === jobId) || mockJobs[0];
      setCurrentJob(job);
      return { success: true, job };
    } catch (error) {
      console.error("Fetch job error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create job
  const createJob = useCallback(async (jobData) => {
    setLoading(true);
    try {
      // TODO: Uncomment when backend is ready
      // const response = await fetch('/api/jobs', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('hirehelp_token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(jobData)
      // });

      // if (!response.ok) throw new Error('Failed to create job');

      // const data = await response.json();
      // setJobs(prev => [data. job, ...prev]);
      // return { success: true, job:  data.job };

      // Mock create
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newJob = {
        _id: "job-" + Date.now(),
        ...jobData,
        status: "active",
        applicants: 0,
        createdAt: new Date().toISOString(),
      };
      setJobs((prev) => [newJob, ...prev]);
      return { success: true, job: newJob };
    } catch (error) {
      console.error("Create job error:", error);
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
        // TODO: Uncomment when backend is ready
        // const response = await fetch(`/api/jobs/${jobId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('hirehelp_token')}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(updates)
        // });

        // if (!response. ok) throw new Error('Failed to update job');

        // const data = await response.json();
        // setJobs(prev => prev.map(job => job._id === jobId ? data.job :  job));
        // if (currentJob? ._id === jobId) setCurrentJob(data.job);
        // return { success: true, job: data.job };

        // Mock update
        await new Promise((resolve) => setTimeout(resolve, 300));
        const updatedJob = { ...currentJob, ...updates };
        setJobs((prev) =>
          prev.map((job) => (job._id === jobId ? updatedJob : job))
        );
        if (currentJob?._id === jobId) setCurrentJob(updatedJob);
        return { success: true, job: updatedJob };
      } catch (error) {
        console.error("Update job error:", error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [currentJob]
  );

  // Apply to job
  const applyToJob = useCallback(async (jobId, applicationData) => {
    setLoading(true);
    try {
      // TODO: Uncomment when backend is ready
      // const response = await fetch(`/api/jobs/${jobId}/apply`, {
      //   method: 'POST',
      //   headers:  {
      //     'Authorization':  `Bearer ${localStorage.getItem('hirehelp_token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(applicationData)
      // });

      // if (!response.ok) throw new Error('Failed to apply');

      // const data = await response.json();
      // return { success: true, application: data.application };

      // Mock apply
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockApplication = {
        _id: "app-" + Date.now(),
        jobId,
        ...applicationData,
        status: "applied",
        appliedAt: new Date().toISOString(),
      };
      return { success: true, application: mockApplication };
    } catch (error) {
      console.error("Apply error:", error);
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
