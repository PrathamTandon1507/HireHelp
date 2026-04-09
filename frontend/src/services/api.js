/**
 * HireHelp API Service
 * Handles all backend communication, token injection, and data normalization.
 */

const API_BASE = '/api';

/**
 * Normalizes snake_case keys from backend to camelCase for frontend
 */
const normalizeResponse = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizeResponse);
  }
  if (data !== null && typeof data === 'object') {
    const normalized = {};
    Object.keys(data).forEach((key) => {
      // Manual mapping for common fields
      let newKey = key;
      if (key === 'full_name') newKey = 'fullName';
      if (key === 'user_id') newKey = 'userId';
      if (key === 'job_id') newKey = 'jobId';
      if (key === 'job_title') newKey = 'jobTitle';
      if (key === 'job_company') newKey = 'jobCompany';
      if (key === 'applicant_id') newKey = 'applicantId';
      if (key === 'applicant_name') newKey = 'applicantName';
      if (key === 'applicant_email') newKey = 'applicantEmail';
      if (key === 'access_token') newKey = 'accessToken';
      if (key === 'created_at') newKey = 'createdAt';
      if (key === 'updated_at') newKey = 'updatedAt';
      if (key === 'is_active') newKey = 'isActive';
      if (key === 'ai_match_score') newKey = 'aiMatchScore';
      if (key === 'ai_explanation') newKey = 'aiExplanation';
      if (key === 'interview_feedback') newKey = 'interviewFeedback';
      if (key === 'interview_details') newKey = 'interviewDetails';
      if (key === 'offer_details') newKey = 'offerDetails';
      if (key === 'posted_by') newKey = 'postedBy';
      if (key === 'resume_path') newKey = 'resumePath';
      if (key === 'resume_text') newKey = 'resumeText';
      if (key === 'interview_questions') newKey = 'interviewQuestions';
      if (key === 'skill_gaps') newKey = 'skillGaps';
      if (key === 'feedback_history') newKey = 'feedbackHistory';
      if (key === 'resume_url') newKey = 'resumeUrl';
      if (key === 'company_name') newKey = 'companyName';
      if (key === 'ai_pros') newKey = 'aiPros';
      if (key === 'ai_cons') newKey = 'aiCons';
      if (key === 'ai_skill_gaps') newKey = 'aiSkillGaps';
      if (key === 'ai_interview_questions') newKey = 'aiInterviewQuestions';
      if (key === 'recipient_id') newKey = 'recipientId';
      if (key === 'sender_id') newKey = 'senderId';
      if (key === 'is_read') newKey = 'isRead';
      
      normalized[newKey] = normalizeResponse(data[key]);
    });
    
    // Explicit ID mapping to ensure components can use either _id or id
    if (data._id || data.id) {
      const idStr = data._id || data.id;
      normalized._id = idStr;
      normalized.id = idStr;
    }
    
    return normalized;
  }
  return data;
};

/**
 * Core fetch wrapper
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('hirehelp_token');
  
  const headers = {
    ...options.headers,
  };

  if (token && !options.noToken) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (don't set Content-Type, browser will do it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'API request failed');
    }

    return normalizeResponse(data);
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      noToken: true
    }),
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      noToken: true
    }),
    me: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    }),
    uploadResume: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/auth/profile/resume', {
        method: 'POST',
        body: formData
      });
    }
  },
  jobs: {
    list: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      return request(`/jobs?${params}`);
    },
    listMyJobs: () => request('/jobs/my-jobs'),
    get: (id) => request(`/jobs/${id}`),
    create: (jobData) => request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),
    update: (id, updates) => request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
    delete: (id) => request(`/jobs/${id}`, {
      method: 'DELETE'
    })
  },
  applications: {
    apply: (jobId, file) => {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('use_profile_resume', 'true');
      }
      return request(`/applications/${jobId}`, {
        method: 'POST',
        body: formData
      });
    },
    get: (id) => request(`/applications/${id}`),
    listMine: () => request('/applications/applicant/my-applications'),
    listMyCandidates: () => request('/applications/recruiter/my-candidates'),
    listForJob: (jobId) => request(`/applications/job/${jobId}`),
    getStats: () => request('/applications/stats/summary'),
    transition: (transitionData) => request('/workflow/transition', {
      method: 'PATCH',
      body: JSON.stringify(transitionData)
    }),
    acceptOffer: (id) => request(`/applications/action/${id}/accept-offer`, {
      method: 'POST'
    }),
    rejectOffer: (id) => request(`/applications/action/${id}/reject-offer`, {
      method: 'POST'
    })
  },
  ai: {
    explain: (applicationId) => request(`/analyze/explain/${applicationId}`, {
      method: 'POST'
    })
  },
  audit: {
    get: (id) => request(`/audit/${id}`)
  },
  notifications: {
    list: () => request('/notifications'),
    getUnreadCount: () => request('/notifications/unread-count'),
    markAsRead: (id) => request(`/notifications/${id}/read`, {
      method: 'PATCH'
    })
  }
};
