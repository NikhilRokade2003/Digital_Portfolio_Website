import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { portfolioAPI, projectAPI, educationAPI, experienceAPI, skillAPI, socialMediaLinkAPI, authAPI } from '../../services/api';

const PortfolioEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [portfolio, setPortfolio] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profileImage: '',
    isPublic: false,
    // Section visibility flags
    isProjectsPublic: true,
    isEducationPublic: true,
    isExperiencePublic: true,
    isSkillsPublic: true,
    isSocialMediaPublic: true,
    email: '',
    phone: '',
    city: '',
    country: ''
  });
  
  // State for file upload functionality
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for project image upload
  const [projectImageFile, setProjectImageFile] = useState(null);
  const [projectImagePreview, setProjectImagePreview] = useState(null);
  const [isProjectImageUploading, setIsProjectImageUploading] = useState(false);
  
  // State for managing tabs
  const [activeTab, setActiveTab] = useState('details');

  // State for collections
  const [projects, setProjects] = useState([]);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form data for adding new items
  const [newProject, setNewProject] = useState({ 
    title: '', 
    description: '', 
    imageUrl: '', 
    projectUrl: '' 
  });
  
  const [newEducation, setNewEducation] = useState({ 
    institution: '', 
    degree: '', 
    field: '', 
    startDate: '', 
    endDate: '', 
    description: '' 
  });
  
  const [newExperience, setNewExperience] = useState({ 
    company: '', 
    position: '', 
    location: '', 
    startDate: '', 
    endDate: '', 
    description: '' 
  });
  
  const [newSkill, setNewSkill] = useState({ 
    name: '', 
    level: 3 
  });
  
  const [newSocialMediaLink, setNewSocialMediaLink] = useState({
    platform: '',
    url: '',
    iconName: ''
  });

  useEffect(() => {
    console.log('PortfolioEdit useEffect running - checking auth and fetching data');
    
    const checkAuthAndFetchData = async () => {
      try {
        console.log('Checking authentication status...');
        const isAuthenticated = await authAPI.isAuthenticated();
        console.log('Authentication check result:', isAuthenticated);
        
        if (!isAuthenticated) {
          console.log('Not authenticated via session check, redirecting to login');
          navigate('/login');
          return;
        }
        
        console.log('User is authenticated, proceeding to fetch portfolio data');
        fetchPortfolioData();
      } catch (err) {
        console.error('Error checking authentication:', err);
        navigate('/login');
      }
    };
    
    checkAuthAndFetchData();
  }, [id, navigate]);

  const fetchPortfolioData = async () => {
    console.log(`Starting fetchPortfolioData for portfolio ID: ${id}`);
    
    try {
      setIsLoading(true);
      
      console.log('Fetching portfolio details...');
      const portfolioResponse = await portfolioAPI.getPortfolio(id);
      console.log('Portfolio details fetched successfully:', portfolioResponse.data);
      
      setPortfolio(portfolioResponse.data);
      setFormData({
        title: portfolioResponse.data.title || '',
        description: portfolioResponse.data.description || '',
        profileImage: portfolioResponse.data.profileImage || '',
        isPublic: portfolioResponse.data.isPublic || false,
        // Set section visibility flags from response
        isProjectsPublic: portfolioResponse.data.isProjectsPublic ?? true,
        isEducationPublic: portfolioResponse.data.isEducationPublic ?? true,
        isExperiencePublic: portfolioResponse.data.isExperiencePublic ?? true,
        isSkillsPublic: portfolioResponse.data.isSkillsPublic ?? true,
        isSocialMediaPublic: portfolioResponse.data.isSocialMediaPublic ?? true,
        email: portfolioResponse.data.email || '',
        phone: portfolioResponse.data.phone || '',
        city: portfolioResponse.data.city || '',
        country: portfolioResponse.data.country || ''
      });

      console.log('Fetching portfolio projects...');
      const projectsResponse = await projectAPI.getProjectsByPortfolio(id);
      console.log(`Fetched ${projectsResponse.data.length} projects`);
      setProjects(projectsResponse.data);

      console.log('Fetching portfolio educations...');
      const educationsResponse = await educationAPI.getEducationsByPortfolio(id);
      console.log(`Fetched ${educationsResponse.data.length} educations`);
      setEducations(educationsResponse.data);

      console.log('Fetching portfolio experiences...');
      const experiencesResponse = await experienceAPI.getExperiencesByPortfolio(id);
      console.log(`Fetched ${experiencesResponse.data.length} experiences`);
      setExperiences(experiencesResponse.data);

      console.log('Fetching portfolio skills...');
      const skillsResponse = await skillAPI.getSkillsByPortfolio(id);
      console.log(`Fetched ${skillsResponse.data.length} skills`);
      setSkills(skillsResponse.data);

      console.log('Fetching portfolio social media links...');
      const socialMediaLinksResponse = await socialMediaLinkAPI.getSocialMediaLinks(id);
      console.log(`Fetched ${socialMediaLinksResponse.data.length} social media links`);
      setSocialMediaLinks(socialMediaLinksResponse.data);
      
      console.log('All portfolio data fetched successfully');

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      console.error('Error details:', err.response?.data || 'No detailed error data');
      console.error('Error status code:', err.response?.status || 'No status code');
      
      setError('Failed to load portfolio data. Please try again.');
      
      if (err.response?.status === 401) {
        console.log('Unauthorized access (401) - redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 404 || err.response?.status === 403) {
        console.log('Resource not found (404) or forbidden (403) - redirecting to dashboard');
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
      console.log('fetchPortfolioData completed, loading state set to false');
    }
  };

  const handlePortfolioChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setProfileImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setError('');
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return null;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', profileImageFile);
      
      const response = await fetch('http://localhost:5163/api/ImageUpload/profile', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
      
      const data = await response.json();
      setIsUploading(false);
      // Ensure the URL has the proper server base URL
      const imageUrl = data.url.startsWith('http') ? data.url : `http://localhost:5163${data.url}`;
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload profile image. Please try again.');
      setIsUploading(false);
      return null;
    }
  };

  const updatePortfolio = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // If there's a profile image to upload, do that first
      let profileImageUrl = formData.profileImage;
      if (profileImageFile) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        } else {
          // If upload failed but it's not critical, continue with the existing URL
          console.warn('Profile image upload failed, continuing with form submission');
        }
      }

      // Update the portfolio with possibly new image URL
      await portfolioAPI.updatePortfolio(id, {
        ...formData,
        profileImage: profileImageUrl
      });
      
      setSuccessMessage('Portfolio details updated successfully!');
      
      // Update the form data with the new image URL if it was changed
      if (profileImageUrl !== formData.profileImage) {
        setFormData(prev => ({
          ...prev,
          profileImage: profileImageUrl
        }));
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating portfolio:', err);
      setError(err.response?.data || 'Failed to update portfolio. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialMediaLinkChange = (e) => {
    setNewSocialMediaLink({
      ...newSocialMediaLink,
      [e.target.name]: e.target.value
    });
  };

  const addSocialMediaLink = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await socialMediaLinkAPI.createSocialMediaLink(id, newSocialMediaLink);
      const socialMediaLinksResponse = await socialMediaLinkAPI.getSocialMediaLinks(id);
      setSocialMediaLinks(socialMediaLinksResponse.data);
      setNewSocialMediaLink({ platform: '', url: '', iconName: '' });
      setSuccessMessage('Social media link added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding social media link:', err);
      setError(err.response?.data || 'Failed to add social media link. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSocialMediaLink = async (linkId) => {
    if (window.confirm('Are you sure you want to delete this social media link?')) {
      try {
        await socialMediaLinkAPI.deleteSocialMediaLink(id, linkId);
        setSocialMediaLinks(socialMediaLinks.filter(link => link.id !== linkId));
        setSuccessMessage('Social media link deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting social media link:', err);
        setError(err.response?.data || 'Failed to delete social media link. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleProjectImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setProjectImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setProjectImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const uploadProjectImage = async () => {
    if (!projectImageFile) return null;
    
    setIsProjectImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', projectImageFile);
      
      const response = await fetch('http://localhost:5163/api/ImageUpload/project', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error('Project image upload failed');
      }
      
      const data = await response.json();
      setIsProjectImageUploading(false);
      // Ensure the URL has the proper server base URL
      const imageUrl = data.url.startsWith('http') ? data.url : `http://localhost:5163${data.url}`;
      return imageUrl;
    } catch (err) {
      console.error('Error uploading project image:', err);
      setError('Failed to upload project image. Please try again.');
      setIsProjectImageUploading(false);
      return null;
    }
  };

  // Handler for project form
  const handleProjectChange = (e) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value
    });
  };

  // Handler for education form
  const handleEducationChange = (e) => {
    setNewEducation({
      ...newEducation,
      [e.target.name]: e.target.value
    });
  };

  // Handler for experience form
  const handleExperienceChange = (e) => {
    setNewExperience({
      ...newExperience,
      [e.target.name]: e.target.value
    });
  };

  // Handler for skill form
  const handleSkillChange = (e) => {
    const value = e.target.type === 'range' ? parseInt(e.target.value, 10) : e.target.value;
    setNewSkill({
      ...newSkill,
      [e.target.name]: value
    });
  };

  const addProject = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // If there's a project image to upload, do that first
      let projectImageUrl = newProject.imageUrl;
      if (projectImageFile) {
        const uploadedUrl = await uploadProjectImage();
        if (uploadedUrl) {
          projectImageUrl = uploadedUrl;
        } else {
          // If upload failed but it's not critical, continue with empty URL
          console.warn('Project image upload failed, continuing with form submission');
        }
      }

      // Create the project with the image URL (uploaded or from input)
      const projectWithImage = {
        ...newProject,
        imageUrl: projectImageUrl
      };

      const response = await projectAPI.createProject(id, projectWithImage);
      const updatedProjects = [...projects, response.data];
      setProjects(updatedProjects);
      
      // Reset form
      setNewProject({ title: '', description: '', imageUrl: '', projectUrl: '' });
      setProjectImageFile(null);
      setProjectImagePreview(null);
      
      setSuccessMessage('Project added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding project:', err);
      setError(err.response?.data || 'Failed to add project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.deleteProject(id, projectId);
        const updatedProjects = projects.filter(project => project.id !== projectId);
        setProjects(updatedProjects);
        setSuccessMessage('Project deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting project:', err);
        setError(err.response?.data || 'Failed to delete project. Please try again.');
      }
    }
  };

  const addEducation = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await educationAPI.createEducation(id, newEducation);
      const updatedEducations = [...educations, response.data];
      setEducations(updatedEducations);
      
      // Reset form
      setNewEducation({ 
        institution: '', 
        degree: '', 
        field: '', 
        startDate: '', 
        endDate: '', 
        description: '' 
      });
      
      setSuccessMessage('Education entry added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding education:', err);
      setError(err.response?.data || 'Failed to add education. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEducation = async (educationId) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      try {
        await educationAPI.deleteEducation(id, educationId);
        const updatedEducations = educations.filter(education => education.id !== educationId);
        setEducations(updatedEducations);
        setSuccessMessage('Education entry deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting education:', err);
        setError(err.response?.data || 'Failed to delete education. Please try again.');
      }
    }
  };

  const addExperience = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await experienceAPI.createExperience(id, newExperience);
      const updatedExperiences = [...experiences, response.data];
      setExperiences(updatedExperiences);
      
      // Reset form
      setNewExperience({ 
        company: '', 
        position: '', 
        location: '', 
        startDate: '', 
        endDate: '', 
        description: '' 
      });
      
      setSuccessMessage('Experience entry added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding experience:', err);
      setError(err.response?.data || 'Failed to add experience. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExperience = async (experienceId) => {
    if (window.confirm('Are you sure you want to delete this experience entry?')) {
      try {
        await experienceAPI.deleteExperience(id, experienceId);
        const updatedExperiences = experiences.filter(experience => experience.id !== experienceId);
        setExperiences(updatedExperiences);
        setSuccessMessage('Experience entry deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting experience:', err);
        setError(err.response?.data || 'Failed to delete experience. Please try again.');
      }
    }
  };

  const addSkill = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await skillAPI.createSkill(id, newSkill);
      const updatedSkills = [...skills, response.data];
      setSkills(updatedSkills);
      
      // Reset form
      setNewSkill({ name: '', level: 3 });
      
      setSuccessMessage('Skill added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding skill:', err);
      setError(err.response?.data || 'Failed to add skill. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSkill = async (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillAPI.deleteSkill(id, skillId);
        const updatedSkills = skills.filter(skill => skill.id !== skillId);
        setSkills(updatedSkills);
        setSuccessMessage('Skill deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting skill:', err);
        setError(err.response?.data || 'Failed to delete skill. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary-700 font-medium">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-medium overflow-hidden transform transition-all duration-300 hover:shadow-lg">
          <div className="bg-primary-600 h-2"></div>
          <div className="px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-extrabold mb-4 sm:mb-0 text-gray-800">
                <span className="bg-clip-text text-transparent bg-gray-800">
                  Edit Portfolio: {portfolio?.title}
                </span>
              </h2>
              <button
                onClick={() => navigate(`/portfolio/view/${id}`)}
                className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md"
              >
                View Portfolio
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-md animate-fade-in-down">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-md animate-fade-in-down">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
            
            <div className="border-b mb-8">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                <li className="mr-2">
                  <button 
                    className={`inline-flex items-center px-4 py-3 rounded-t-lg ${activeTab === 'details' 
                      ? 'text-purple-600 border-b-2 border-purple-600 active' 
                      : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'} group`}
                    onClick={() => setActiveTab('details')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'details' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0010-4.546A5 5 0 0010 7z" clipRule="evenodd"></path>
                    </svg>
                    Portfolio Details
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    className={`inline-flex items-center px-4 py-3 rounded-t-lg ${activeTab === 'projects' 
                      ? 'text-purple-600 border-b-2 border-purple-600 active' 
                      : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'} group`}
                    onClick={() => setActiveTab('projects')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'projects' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                    Projects
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    className={`inline-flex items-center px-4 py-3 rounded-t-lg ${activeTab === 'education' 
                      ? 'text-purple-600 border-b-2 border-purple-600 active' 
                      : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'} group`}
                    onClick={() => setActiveTab('education')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'education' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                    </svg>
                    Education
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    className={`inline-flex items-center px-4 py-3 rounded-t-lg ${activeTab === 'experience' 
                      ? 'text-purple-600 border-b-2 border-purple-600 active' 
                      : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'} group`}
                    onClick={() => setActiveTab('experience')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'experience' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2 8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                    </svg>
                    Experience
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    className={`inline-flex items-center px-4 py-3 rounded-t-lg ${activeTab === 'skills' 
                      ? 'text-purple-600 border-b-2 border-purple-600 active' 
                      : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'} group`}
                    onClick={() => setActiveTab('skills')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'skills' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                    </svg>
                    Skills
                  </button>
                </li>
                <li>
                  <button 
                    className={`inline-flex items-center px-4 py-3 rounded-t-lg ${activeTab === 'social-media' 
                      ? 'text-purple-600 border-b-2 border-purple-600 active' 
                      : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'} group`}
                    onClick={() => setActiveTab('social-media')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'social-media' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM12 8a2 2 0 11-4 0 2 2 0 014 0zM16 8a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Social Media
                  </button>
                </li>
              </ul>
            </div>
            
            {activeTab === 'details' && (
              <form onSubmit={updatePortfolio} className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-5 text-gray-800 border-l-4 border-purple-500 pl-3">Portfolio Details</h3>
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Portfolio Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handlePortfolioChange}
                    className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handlePortfolioChange}
                    className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    rows="5"
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Profile Image
                  </label>
                  
                  <div className="mt-2 flex items-start space-x-6">
                    <div>
                      <label className="cursor-pointer bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                        <span>Upload a file</span>
                        <input 
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    
                    {previewImage ? (
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-purple-200 shadow-lg">
                          <img 
                            src={previewImage} 
                            alt="Profile preview" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          className="absolute top-0 right-0 rounded-full bg-red-500 text-white p-1 shadow-sm"
                          onClick={() => {
                            setPreviewImage(null);
                            setProfileImageFile(null);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : formData.profileImage ? (
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-purple-200 shadow-lg">
                          <img 
                            src={formData.profileImage} 
                            alt="Current profile" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-gray-700 text-sm mb-2" htmlFor="profileImage">
                      Or enter an image URL
                    </label>
                    <input
                      type="url"
                      id="profileImage"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handlePortfolioChange}
                      className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handlePortfolioChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <label className="text-gray-700 font-medium" htmlFor="isPublic">
                      Make portfolio public
                    </label>
                  </div>
                  <p className="mt-1 text-gray-500 ml-8">Public portfolios can be viewed by anyone with the link</p>
                  
                  {/* Section visibility controls - only shown if portfolio is public */}
                  {formData.isPublic && (
                    <div className="mt-4 pl-8 border-t border-blue-100 pt-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Section Visibility Settings</h5>
                      <p className="text-xs text-gray-500 mb-3">Control which sections of your portfolio are visible to the public</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isProjectsPublic"
                            name="isProjectsPublic"
                            checked={formData.isProjectsPublic}
                            onChange={handlePortfolioChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                          />
                          <label className="text-gray-600 text-sm" htmlFor="isProjectsPublic">
                            Projects section
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isEducationPublic"
                            name="isEducationPublic"
                            checked={formData.isEducationPublic}
                            onChange={handlePortfolioChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                          />
                          <label className="text-gray-600 text-sm" htmlFor="isEducationPublic">
                            Education section
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isExperiencePublic"
                            name="isExperiencePublic"
                            checked={formData.isExperiencePublic}
                            onChange={handlePortfolioChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                          />
                          <label className="text-gray-600 text-sm" htmlFor="isExperiencePublic">
                            Experience section
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isSkillsPublic"
                            name="isSkillsPublic"
                            checked={formData.isSkillsPublic}
                            onChange={handlePortfolioChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                          />
                          <label className="text-gray-600 text-sm" htmlFor="isSkillsPublic">
                            Skills section
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isSocialMediaPublic"
                            name="isSocialMediaPublic"
                            checked={formData.isSocialMediaPublic}
                            onChange={handlePortfolioChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                          />
                          <label className="text-gray-600 text-sm" htmlFor="isSocialMediaPublic">
                            Social Media links
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">Contact Information</h4>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handlePortfolioChange}
                        className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 002-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePortfolioChange}
                        className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                        City
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handlePortfolioChange}
                          className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                        Country
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945A8.935 8.935 0 004 17V5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handlePortfolioChange}
                          className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="group relative bg-white text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="ml-4">Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="group relative flex justify-center py-3 px-8 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-800 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                    disabled={isSaving || isUploading}
                  >
                    {isSaving || isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                          <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="ml-4">Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {activeTab === 'social-media' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-purple-500 pl-3">Social Media Links</h3>
                
                {socialMediaLinks.length > 0 ? (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {socialMediaLinks.map(link => (
                        <div key={link.id} className="border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800 flex items-center">
                              {link.iconName && (
                                <span className="mr-2 inline-block p-2 rounded-full bg-purple-100">
                                  {link.iconName === 'linkedin' && <i className="fab fa-linkedin text-blue-700"></i>}
                                  {link.iconName === 'github' && <i className="fab fa-github text-gray-800"></i>}
                                  {link.iconName === 'twitter' && <i className="fab fa-twitter text-blue-400"></i>}
                                  {link.iconName === 'facebook' && <i className="fab fa-facebook text-blue-600"></i>}
                                  {link.iconName === 'instagram' && <i className="fab fa-instagram text-pink-600"></i>}
                                  {link.iconName === 'youtube' && <i className="fab fa-youtube text-red-600"></i>}
                                  {link.iconName === 'medium' && <i className="fab fa-medium text-gray-600"></i>}
                                  {link.iconName === 'globe' && <i className="fas fa-globe text-green-600"></i>}
                                  {link.iconName === 'link' && <i className="fas fa-link text-gray-600"></i>}
                                </span>
                              )}
                              {link.platform}
                            </h4>
                            <button 
                              onClick={() => deleteSocialMediaLink(link.id)}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          </div>
                          <div className="mt-3">
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-gray-600 text-lg bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-10 h-10 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p>No social media links added yet. Add links below to connect with your audience.</p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">Add New Social Media Link</h4>
                  <form onSubmit={addSocialMediaLink} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="platform">
                        Platform*
                      </label>
                      <select
                        id="platform"
                        name="platform"
                        value={newSocialMediaLink.platform}
                        onChange={handleSocialMediaLinkChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="">Select a platform</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="GitHub">GitHub</option>
                        <option value="Twitter">Twitter</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Medium">Medium</option>
                        <option value="Portfolio">Personal Website</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
                        URL*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                          </svg>
                        </div>
                        <input
                          type="url"
                          id="url"
                          name="url"
                          value={newSocialMediaLink.url}
                          onChange={handleSocialMediaLinkChange}
                          className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                          placeholder="https://example.com/your-profile"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="iconName">
                        Icon Name (optional)
                      </label>
                      <select
                        id="iconName"
                        name="iconName"
                        value={newSocialMediaLink.iconName}
                        onChange={handleSocialMediaLinkChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Select an icon or leave empty</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="medium">Medium</option>
                        <option value="globe">Globe (Website)</option>
                        <option value="link">Generic Link</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">This will be used to display the proper icon for your social link</p>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        <>
                          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-4">Add Social Media Link</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-purple-500 pl-3">Projects</h3>
                
                {projects.length > 0 ? (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {projects.map(project => (
                        <div key={project.id} className="border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-violet-50 to-white">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{project.title}</h4>
                            <button 
                              onClick={() => deleteProject(project.id)}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          </div>
                          <p className="text-gray-700 mt-2">{project.description}</p>
                          {project.imageUrl && (
                            <div className="mt-3">
                              <img 
                                src={project.imageUrl} 
                                alt={project.title} 
                                className="h-40 w-full object-cover rounded-lg shadow-sm"
                              />
                            </div>
                          )}
                          {project.projectUrl && (
                            <div className="mt-3">
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                                </svg>
                                Visit Project
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-gray-600 text-lg bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-10 h-10 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p>No projects added yet. Showcase your work by adding projects below.</p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">Add New Project</h4>
                  <form onSubmit={addProject} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectTitle">
                        Project Title*
                      </label>
                      <input
                        type="text"
                        id="projectTitle"
                        name="title"
                        value={newProject.title}
                        onChange={handleProjectChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectDescription">
                        Description
                      </label>
                      <textarea
                        id="projectDescription"
                        name="description"
                        value={newProject.description}
                        onChange={handleProjectChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        rows="3"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectImageUrl">
                        Project Image
                      </label>
                      
                      <div className="mt-2 flex items-start space-x-6">
                        <div>
                          <label className="cursor-pointer bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            <span>Upload a file</span>
                            <input 
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleProjectImageChange}
                            />
                          </label>
                          {newProject.imageUrl && !projectImagePreview && (
                            <p className="mt-2 text-xs text-gray-500">Current URL: {newProject.imageUrl}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        
                        {projectImagePreview && (
                          <div className="relative">
                            <div className="h-32 w-48 overflow-hidden border-2 border-purple-200 rounded-lg shadow-md">
                              <img 
                                src={projectImagePreview} 
                                alt="Project preview" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              className="absolute top-0 right-0 rounded-full bg-red-500 text-white p-1 shadow-sm"
                              onClick={() => {
                                setProjectImagePreview(null);
                                setProjectImageFile(null);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-gray-700 text-sm mb-2" htmlFor="projectImageUrl">
                          Or enter an image URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="url"
                            id="projectUrl"
                            name="projectUrl"
                            value={newProject.projectUrl}
                            onChange={handleProjectChange}
                            className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            placeholder="https://example.com/your-project"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md"
                      disabled={isSaving || isProjectImageUploading}
                    >
                      {isSaving || isProjectImageUploading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        <>
                          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-4">Add Project</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-purple-500 pl-3">Education</h3>
                
                {educations.length > 0 ? (
                  <div className="mb-8">
                    <div className="space-y-5">
                      {educations.map(education => (
                        <div key={education.id} className="border-l-4 border-indigo-500 pl-5 py-3 bg-gradient-to-r from-indigo-50 to-white rounded-r-lg hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800 flex items-center">
                              {education.degree}{education.field ? ` in ${education.field}` : ''}
                            </h4>
                            <button 
                              onClick={() => deleteEducation(education.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-gray-700 font-medium">{education.institution}</p>
                          <p className="text-indigo-600 mt-1">
                            {education.startDate ? new Date(education.startDate).toLocaleDateString() : ''} - 
                            {education.endDate ? new Date(education.endDate).toLocaleDateString() : ' Present'}
                          </p>
                          {education.description && (
                            <p className="text-gray-700 mt-2">{education.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-gray-600 text-lg bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-10 h-10 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p>No education entries added yet. Add your educational background below.</p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">Add New Education</h4>
                  <form onSubmit={addEducation} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="institution">
                        Institution*
                      </label>
                      <input
                        type="text"
                        id="institution"
                        name="institution"
                        value={newEducation.institution}
                        onChange={handleEducationChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="degree">
                        Degree*
                      </label>
                      <input
                        type="text"
                        id="degree"
                        name="degree"
                        value={newEducation.degree}
                        onChange={handleEducationChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="field">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        id="field"
                        name="field"
                        value={newEducation.field}
                        onChange={handleEducationChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                          Start Date*
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={newEducation.startDate}
                          onChange={handleEducationChange}
                          className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                          End Date (leave empty if current)
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={newEducation.endDate}
                          onChange={handleEducationChange}
                          className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="educationDescription">
                        Description
                      </label>
                      <textarea
                        id="educationDescription"
                        name="description"
                        value={newEducation.description}
                        onChange={handleEducationChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        rows="3"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        <>
                          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-4">Add Education</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-purple-500 pl-3">Work Experience</h3>
                
                {experiences.length > 0 ? (
                  <div className="mb-8">
                    <div className="space-y-5">
                      {experiences.map(experience => (
                        <div key={experience.id} className="border-l-4 border-purple-500 pl-5 py-3 bg-gradient-to-r from-purple-50 to-white rounded-r-lg hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{experience.position}</h4>
                            <button 
                              onClick={() => deleteExperience(experience.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-gray-700 font-medium">{experience.company}{experience.location ? ` - ${experience.location}` : ''}</p>
                          <p className="text-purple-600 mt-1">
                            {experience.startDate ? new Date(experience.startDate).toLocaleDateString() : ''} - 
                            {experience.endDate ? new Date(experience.endDate).toLocaleDateString() : ' Present'}
                          </p>
                          {experience.description && (
                            <p className="text-gray-700 mt-2">{experience.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-gray-600 text-lg bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-10 h-10 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p>No work experience entries added yet. Add your work experience below.</p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">Add New Work Experience</h4>
                  <form onSubmit={addExperience} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                        Company*
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={newExperience.company}
                        onChange={handleExperienceChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                        Position*
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={newExperience.position}
                        onChange={handleExperienceChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={newExperience.location}
                        onChange={handleExperienceChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experienceStartDate">
                          Start Date*
                        </label>
                        <input
                          type="date"
                          id="experienceStartDate"
                          name="startDate"
                          value={newExperience.startDate}
                          onChange={handleExperienceChange}
                          className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experienceEndDate">
                          End Date (leave empty if current)
                        </label>
                        <input
                          type="date"
                          id="experienceEndDate"
                          name="endDate"
                          value={newExperience.endDate}
                          onChange={handleExperienceChange}
                          className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experienceDescription">
                        Description
                      </label>
                      <textarea
                        id="experienceDescription"
                        name="description"
                        value={newExperience.description}
                        onChange={handleExperienceChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        rows="3"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        <>
                          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-4">Add Experience</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-purple-500 pl-3">Skills</h3>
                
                {skills.length > 0 ? (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {skills.map(skill => (
                        <div key={skill.id} className="border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all bg-gray-50 to-white">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{skill.name}</h4>
                            <button 
                              onClick={() => deleteSkill(skill.id)}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Remove
                            </button>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-gray-400 h-2.5 rounded-full" 
                                  style={{ width: `${(skill.level / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-700">{skill.level}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-gray-600 text-lg bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-10 h-10 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p>No skills added yet. Showcase your expertise by adding skills below.</p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">Add New Skill</h4>
                  <form onSubmit={addSkill} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skillName">
                        Skill Name*
                      </label>
                      <input
                        type="text"
                        id="skillName"
                        name="name"
                        value={newSkill.name}
                        onChange={handleSkillChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skillLevel">
                        Skill Level (1-5)*: {newSkill.level}
                      </label>
                      <input
                        type="range"
                        id="skillLevel"
                        name="level"
                        min="1"
                        max="5"
                        value={newSkill.level}
                        onChange={handleSkillChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
                        required
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                        <span>Beginner</span>
                        <span>Intermediate</span>
                        <span>Expert</span>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        <>
                          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-4">Add Skill</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioEdit;