import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://kamlesh180404.github.io/DigitalPortfolioBackend/api'
    : 'http://localhost:5163/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Important: this allows cookies to be sent with requests
  withCredentials: true
});

// Add a request interceptor for logging purposes (no token handling needed anymore)
api.interceptors.request.use(
  (config) => {
    console.log(`Request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log(`API Error ${error.response.status} on ${error.config.url}`);
      
      // Only handle authentication errors for non-auth endpoints
      if (error.response.status === 401 && !error.config.url.includes('/Auth/')) {
        console.log('Unauthorized access detected on protected endpoint');
      }
    } else if (error.request) {
      console.log('No response received from server');
    } else {
      console.log('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/Auth/register', userData),
  login: (credentials) => api.post('/Auth/login', credentials),
  logout: () => api.post('/Auth/logout'),
  // Check if the user is authenticated by calling the check-session endpoint
  checkSession: async () => {
    try {
      const response = await api.get('/Auth/check-session');
      return response.data.isAuthenticated;
    } catch (error) {
      return false;
    }
  },
  // New method to replace isAuthenticated
  isAuthenticated: async function() {
    return await this.checkSession();
  }
};

// Portfolio API
export const portfolioAPI = {
  getPublicPortfolios: () => api.get('/Portfolio/public'),
  getAllVisiblePortfolios: () => api.get('/Portfolio/all-visible'),
  getMyPortfolios: () => api.get('/Portfolio/my-portfolios'),
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

export default api;
