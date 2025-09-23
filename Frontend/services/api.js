import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5163/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Important: this allows cookies to be sent with requests
  withCredentials: true
});

// Add a request interceptor for error handling only
api.interceptors.request.use(
  (config) => {
    // Clean request processing without console noise
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for comprehensive error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress all known unimplemented endpoint errors
    const shouldSuppress = (
      (error.response?.status === 500 && 
       (error.config?.url?.includes('/AccessRequest') ||
        error.config?.url?.includes('/Chatbot/history'))) ||
      (error.response?.status === 404 && 
       (error.config?.url?.includes('/Chatbot/history') ||
        error.config?.url?.includes('/Chatbot/') ||
        error.config?.url?.includes('/Auth/profile'))) ||
      (error.response?.status === 401 && 
       (error.config?.url?.includes('/Auth/login') ||
        error.config?.url?.includes('/Auth/profile')))
    );
    
    // Only log unexpected errors to keep console clean
    if (!shouldSuppress) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API with caching to reduce duplicate calls
let authCache = {
  isAuthenticated: null,
  timestamp: 0,
  CACHE_DURATION: 30000 // 30 seconds
};

export const authAPI = {
  register: (userData) => api.post('/Auth/register', userData),
  login: async (credentials) => {
    const result = await api.post('/Auth/login', credentials);
    authAPI.clearAuthCache(); // Clear cache on login
    return result;
  },
  logout: async () => {
    const result = await api.post('/Auth/logout');
    authAPI.clearAuthCache(); // Clear cache on logout
    return result;
  },
  forgotPassword: (email) => api.post('/Auth/forgot-password', { email }),
  // Return current user payload from session endpoint
  getCurrentUser: async () => {
    const res = await api.get('/Auth/check-session');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.put('/Auth/profile', profileData);
    return res.data;
  },
  // Check if the user is authenticated by calling the check-session endpoint
  checkSession: async () => {
    // Check cache first
    const now = Date.now();
    if (authCache.isAuthenticated !== null && now - authCache.timestamp < authCache.CACHE_DURATION) {
      return authCache.isAuthenticated;
    }

    try {
      const response = await api.get('/Auth/check-session');
      const isAuth = response.data.isAuthenticated;
      
      // Update cache
      authCache.isAuthenticated = isAuth;
      authCache.timestamp = now;
      
      return isAuth;
    } catch (error) {
      // Cache false result for failed checks
      authCache.isAuthenticated = false;
      authCache.timestamp = now;
      return false;
    }
  },
  // New method to replace isAuthenticated
  isAuthenticated: async function() {
    return await this.checkSession();
  },
  // Method to clear cache (call on login/logout)
  clearAuthCache: function() {
    authCache.isAuthenticated = null;
    authCache.timestamp = 0;
  }
};

// Portfolio API
export const portfolioAPI = {
  getPublicPortfolios: () => api.get('/Portfolio/public'),
  getAllVisiblePortfolios: () => api.get('/Portfolio/all-visible'),
  getMyPortfolios: () => api.get('/Portfolio/my-portfolios'),
  getAccessiblePortfolios: () => api.get('/Portfolio/accessible'),
  getPortfolio: (id) => api.get(`/Portfolio/${id}`),
  createPortfolio: (portfolioData) => api.post('/Portfolio', portfolioData),
  updatePortfolio: (id, portfolioData) => api.put(`/Portfolio/${id}`, portfolioData),
  deletePortfolio: (id) => api.delete(`/Portfolio/${id}`),
  // New method to download portfolio as PDF
  downloadPDF: (id) => {
    return api.get(`/Portfolio/${id}/pdf`, {
      responseType: 'blob', // Important for binary data like PDFs
    });
  }
};

// Access Requests API
export const accessRequestAPI = {
  create: (portfolioId, message) => {
    console.log('AccessRequestAPI.create called with:', { portfolioId, message });
    return api.post(`/AccessRequest/portfolio/${portfolioId}`, { message: message ?? '' });
  },
  approve: (requestId, note) => api.post(`/AccessRequest/${requestId}/approve`, { message: note ?? '' }),
  reject: (requestId, note) => api.post(`/AccessRequest/${requestId}/reject`, { message: note ?? '' }),
  myReceived: () => api.get('/AccessRequest/my/received'),
  mySent: () => api.get('/AccessRequest/my/sent')
};

// Notifications API
export const notificationAPI = {
  my: () => api.get('/Notification/my'),
  markRead: (id) => api.post(`/Notification/${id}/read`),
  markAllRead: () => api.post('/Notification/read-all')
};

// Project API
export const projectAPI = {
  getProjects: () => api.get('/Project'),
  getProjectsByPortfolio: (portfolioId) => api.get(`/Project/portfolio/${portfolioId}`),
  createProject: (portfolioId, project) => api.post(`/Project/portfolio/${portfolioId}`, project),
  updateProject: (id, project) => api.put(`/Project/${id}`, project),
  deleteProject: (id) => api.delete(`/Project/${id}`)
};

// Experience API
export const experienceAPI = {
  getExperiences: () => api.get('/Experience'),
  getExperiencesByPortfolio: (portfolioId) => api.get(`/Experience/portfolio/${portfolioId}`),
  createExperience: (portfolioId, experience) => api.post(`/Experience/portfolio/${portfolioId}`, experience),
  updateExperience: (id, experience) => api.put(`/Experience/${id}`, experience),
  deleteExperience: (id) => api.delete(`/Experience/${id}`)
};

// Education API
export const educationAPI = {
  getEducations: () => api.get('/Education'),
  getEducationsByPortfolio: (portfolioId) => api.get(`/Education/Portfolio/${portfolioId}`),
  createEducation: (portfolioId, education) => api.post(`/Education/portfolio/${portfolioId}`, education),
  updateEducation: (id, education) => api.put(`/Education/${id}`, education),
  deleteEducation: (id) => api.delete(`/Education/${id}`)
};

// Skill API
export const skillAPI = {
  getSkills: () => api.get('/Skill'),
  getSkillsByPortfolio: (portfolioId) => api.get(`/Skill/portfolio/${portfolioId}`),
  createSkill: (portfolioId, skill) => api.post(`/Skill/portfolio/${portfolioId}`, skill),
  updateSkill: (id, skill) => api.put(`/Skill/${id}`, skill),
  deleteSkill: (id) => api.delete(`/Skill/${id}`)
};

// Social Media Link API
export const socialMediaLinkAPI = {
  getSocialMediaLinks: (portfolioId) => api.get(`/Portfolio/${portfolioId}/social-media`),
  getSocialMediaLink: (portfolioId, id) => api.get(`/Portfolio/${portfolioId}/social-media/${id}`),
  createSocialMediaLink: (portfolioId, link) => api.post(`/Portfolio/${portfolioId}/social-media`, link),
  updateSocialMediaLink: (portfolioId, id, link) => api.put(`/Portfolio/${portfolioId}/social-media/${id}`, link),
  deleteSocialMediaLink: (portfolioId, id) => api.delete(`/Portfolio/${portfolioId}/social-media/${id}`)
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/Admin/users'),
  getPortfolios: () => api.get('/Admin/portfolios'),
  deleteUser: (id) => api.delete(`/Admin/users/${id}`),
  resetUserPassword: (id) => api.post(`/Admin/users/${id}/reset-password`),
  updateUserRole: (id, role) => api.put(`/Admin/users/${id}/role`, { role }),
  getSystemStats: () => api.get('/Admin/stats'),
  getPortfolioStats: () => api.get('/Admin/portfolio-stats'),
  getUserActivity: () => api.get('/Admin/user-activity')
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => api.post('/Chatbot/message', { message }),
  getConversationHistory: () => api.get('/Chatbot/history'),
  clearHistory: () => api.delete('/Chatbot/history'),
  generatePortfolio: (userInfo) => api.post('/Chatbot/generate-portfolio', userInfo),
  analyzePortfolio: (portfolioData) => api.post('/Chatbot/analyze-portfolio', portfolioData),
  generateProjectDescription: (projectData) => api.post('/Chatbot/generate-project-description', projectData),
  suggestSkills: (skillRequest) => api.post('/Chatbot/suggest-skills', skillRequest),
  reviewPortfolio: (portfolioData) => api.post('/Chatbot/review-portfolio', portfolioData)
};

// Image Upload API
export const imageUploadAPI = {
  uploadProfile: (formData) => api.post('/ImageUpload/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadProject: (formData) => api.post('/ImageUpload/project', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Statistics API
export const statisticsAPI = {
  getStatistics: () => api.get('/Statistics'),
  getDashboardStatistics: () => api.get('/Statistics/dashboard')
};

export default api;
