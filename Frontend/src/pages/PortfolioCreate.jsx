import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { portfolioAPI, educationAPI, experienceAPI, projectAPI, skillAPI } from '../../services/api';

const PortfolioCreate = () => {
  // State for form data with default values for all fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profileImage: '',
    isPublic: false,
    // Default section visibility flags (all set to true by default)
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
  
  // State for managing tabs
  const [activeTab, setActiveTab] = useState('details');
  
  const handleTabChange = (tabName) => {
    console.log(`Switching tab from ${activeTab} to ${tabName}`);
    setActiveTab(tabName);
  };
  
  // State for file upload functionality
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for new items
  const [newProject, setNewProject] = useState({ 
    title: '', 
    description: '', 
    imageUrl: '', 
    projectUrl: '' 
  });
  
  // State for project image upload
  const [projectImageFile, setProjectImageFile] = useState(null);
  const [projectImagePreview, setProjectImagePreview] = useState(null);
  const [isProjectImageUploading, setIsProjectImageUploading] = useState(false);
  
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
  
  // Add state for social media links
  const [newSocialMediaLink, setNewSocialMediaLink] = useState({
    platform: '',
    url: '',
    iconName: ''
  });
  
  // State for data collections
  const [projects, setProjects] = useState([]);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
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
      
      // Fix: Ensure the URL is properly constructed by checking if it's relative or absolute
      let imageUrl = data.url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // If it's a relative URL, prepend the base URL
        imageUrl = `http://localhost:5163${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      
      console.log('Uploaded profile image URL:', imageUrl);
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload profile image. Please try again.');
      setIsUploading(false);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Log current state of all arrays before submission
      console.log('Submitting portfolio with the following data:');
      console.log('Projects:', projects.length, projects);
      console.log('Educations:', educations.length, educations);
      console.log('Experiences:', experiences.length, experiences);
      console.log('Skills:', skills.length, skills);
      
      // If there's a profile image to upload, do that first
      let profileImageUrl = formData.profileImage;
      if (profileImageFile) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        } else {
          // If upload failed but it's not critical, continue with empty URL
          console.warn('Profile image upload failed, continuing with form submission');
        }
      }

      // Add social media links to the portfolio data
      const portfolioData = {
        ...formData,
        profileImage: profileImageUrl,
        socialMediaLinks: socialMediaLinks
      };
      
      console.log('Creating portfolio with data:', portfolioData);
      const response = await portfolioAPI.createPortfolio(portfolioData);
      const portfolioId = response.data.id;
      console.log('Portfolio created with ID:', portfolioId);
      
      // Create all the related items if they exist
      // Projects
      for (const project of projects) {
        console.log('Creating project:', project);
        await projectAPI.createProject(portfolioId, project);
      }
      
      // Education
      for (const education of educations) {
        console.log('Creating education:', education);
        await educationAPI.createEducation(portfolioId, education);
      }
      
      // Experience
      for (const experience of experiences) {
        console.log('Creating experience:', experience);
        await experienceAPI.createExperience(portfolioId, experience);
      }
      
      // Skills
      for (const skill of skills) {
        console.log('Creating skill:', skill);
        await skillAPI.createSkill(portfolioId, skill);
      }
      
      // Navigation happens after all items are created
      console.log('All portfolio items created, navigating to view page');
      navigate(`/portfolio/view/${portfolioId}`);
    } catch (err) {
      console.error('Error creating portfolio:', err);
      setError(err.response?.data || 'Failed to create portfolio. Please try again.');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      
      setIsLoading(false);
    }
  };

  // Rest of the existing methods...

  // Handler for project form
  const handleProjectChange = (e) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value
    });
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
      
      // Fix: Ensure the URL is properly constructed by checking if it's relative or absolute
      let imageUrl = data.url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // If it's a relative URL, prepend the base URL
        imageUrl = `http://localhost:5163${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      
      console.log('Uploaded project image URL:', imageUrl);
      return imageUrl;
    } catch (err) {
      console.error('Error uploading project image:', err);
      setError('Failed to upload project image. Please try again.');
      setIsProjectImageUploading(false);
      return null;
    }
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

  const addNewProject = async (e) => {
    e.preventDefault();
    
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

    const projectWithImage = {
      ...newProject,
      imageUrl: projectImageUrl
    };
    
    setProjects([...projects, projectWithImage]);
    setNewProject({ title: '', description: '', imageUrl: '', projectUrl: '' });
    setProjectImageFile(null);
    setProjectImagePreview(null);
    setSuccessMessage('Project added to your new portfolio!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const removeProject = (index) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    setProjects(updatedProjects);
  };
  
  // Handler for education form
  const handleEducationChange = (e) => {
    setNewEducation({
      ...newEducation,
      [e.target.name]: e.target.value
    });
  };

  const addNewEducation = (e) => {
    e.preventDefault();
    const updatedEducations = [...educations, newEducation];
    console.log('Adding education item:', newEducation);
    console.log('Updated educations array:', updatedEducations);
    setEducations(updatedEducations);
    setNewEducation({ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' });
    setSuccessMessage('Education added to your new portfolio!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const removeEducation = (index) => {
    const updatedEducations = [...educations];
    updatedEducations.splice(index, 1);
    setEducations(updatedEducations);
  };
  
  // Handler for experience form
  const handleExperienceChange = (e) => {
    setNewExperience({
      ...newExperience,
      [e.target.name]: e.target.value
    });
  };

  const addNewExperience = (e) => {
    e.preventDefault();
    const updatedExperiences = [...experiences, newExperience];
    console.log('Adding experience item:', newExperience);
    console.log('Updated experiences array:', updatedExperiences);
    setExperiences(updatedExperiences);
    setNewExperience({ company: '', position: '', location: '', startDate: '', endDate: '', description: '' });
    setSuccessMessage('Experience added to your new portfolio!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const removeExperience = (index) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
  };
  
  // Handler for skill form
  const handleSkillChange = (e) => {
    const value = e.target.name === "level" 
      ? parseInt(e.target.value) 
      : e.target.value;
    
    setNewSkill({
      ...newSkill,
      [e.target.name]: value
    });
  };

  const addNewSkill = (e) => {
    e.preventDefault();
    const updatedSkills = [...skills, newSkill];
    console.log('Adding skill item:', newSkill);
    console.log('Updated skills array:', updatedSkills);
    setSkills(updatedSkills);
    setNewSkill({ name: '', level: 3 });
    setSuccessMessage('Skill added to your new portfolio!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const removeSkill = (index) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);
  };
  
  // Handler for social media link form
  const handleSocialMediaLinkChange = (e) => {
    setNewSocialMediaLink({
      ...newSocialMediaLink,
      [e.target.name]: e.target.value
    });
  };

  const addNewSocialMediaLink = (e) => {
    e.preventDefault();
    setSocialMediaLinks([...socialMediaLinks, newSocialMediaLink]);
    setNewSocialMediaLink({ platform: '', url: '', iconName: '' });
    setSuccessMessage('Social Media Link added to your new portfolio!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const removeSocialMediaLink = (index) => {
    const updatedSocialMediaLinks = [...socialMediaLinks];
    updatedSocialMediaLinks.splice(index, 1);
    setSocialMediaLinks(updatedSocialMediaLinks);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-medium overflow-hidden transform transition-all duration-300 hover:shadow-lg">
          <div className="bg-primary-600 h-2"></div>
          <div className="px-8 py-8">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center">
              <span className="bg-clip-text text-transparent bg-gray-800">Create New Portfolio</span>
              <span className="ml-3 px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-full shadow-md">New</span>
            </h2>
            
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
            
            {/* Tabs navigation */}
            <div className="border-b mb-8">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                <li className="mr-2">
                  <button 
                    className={`inline-flex items-center px-4 py-3 rounded-t-lg ${activeTab === 'details' 
                      ? 'text-purple-600 border-b-2 border-purple-600 active' 
                      : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'} group`}
                    onClick={() => handleTabChange('details')}
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
                    onClick={() => handleTabChange('projects')}
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
                    onClick={() => handleTabChange('education')}
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
                    onClick={() => handleTabChange('experience')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'experience' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2 1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
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
                    onClick={() => handleTabChange('skills')}
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
                    onClick={() => handleTabChange('social-media')}
                  >
                    <svg className={`w-5 h-5 mr-2 ${activeTab === 'social-media' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM12 8a2 2 0 11-4 0 2 2 0 014 0zM16 8a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Social Media
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Portfolio Details Tab */}
            {activeTab === 'details' && (
              <div className="animate-fade-in">
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
                    onChange={handleChange}
                    className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                    placeholder="e.g., My Professional Portfolio"
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
                    onChange={handleChange}
                    className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    rows="5"
                    placeholder="A brief description of your portfolio"
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
                      {formData.profileImage && !previewImage && (
                        <p className="mt-2 text-xs text-gray-500">Current URL: {formData.profileImage}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    
                    {previewImage && (
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
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-gray-700 text-sm mb-2" htmlFor="profileImageUrl">
                      Or enter an image URL
                    </label>
                    <input
                      type="url"
                      id="profileImageUrl"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleChange}
                      className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="https://example.com/your-profile-image.jpg"
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
                      onChange={handleChange}
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
                            onChange={handleChange}
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
                            onChange={handleChange}
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
                            onChange={handleChange}
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
                            onChange={handleChange}
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
                            onChange={handleChange}
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
                        onChange={handleChange}
                        className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="your.email@example.com"
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="+1 (123) 456-7890"
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
                          onChange={handleChange}
                          className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="San Francisco"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="pl-10 shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Projects Tab - Unchanged except for some styling improvements */}
            {activeTab === 'projects' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Projects</h3>
                
                {projects.length > 0 ? (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {projects.map((project, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{project.title}</h4>
                            <button 
                              onClick={() => removeProject(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-gray-700 mt-2">{project.description}</p>
                          {project.imageUrl && (
                            <div className="mt-3">
                              <img 
                                src={project.imageUrl} 
                                alt={project.title} 
                                className="h-40 w-full object-cover rounded-lg"
                              />
                            </div>
                          )}
                          {project.projectUrl && (
                            <div className="mt-3">
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                Project Link
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mb-6 text-gray-600 text-lg">No projects added yet. Add projects below.</p>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800">Add New Project</h4>
                  <form onSubmit={addNewProject}>
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
                        Image URL
                      </label>
                      <input
                        type="url"
                        id="projectImageUrl"
                        name="imageUrl"
                        value={newProject.imageUrl}
                        onChange={handleProjectChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectUrl">
                        Project URL
                      </label>
                      <input
                        type="url"
                        id="projectUrl"
                        name="projectUrl"
                        value={newProject.projectUrl}
                        onChange={handleProjectChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md"
                    >
                      Add Project
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Education Tab - Unchanged except for some styling improvements */}
            {activeTab === 'education' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Education</h3>
                
                {educations.length > 0 ? (
                  <div className="mb-8">
                    <div className="space-y-5">
                      {educations.map((education, index) => (
                        <div key={index} className="border-l-4 border-indigo-500 pl-5 py-3 bg-gradient-to-r from-indigo-50 to-white rounded-r-lg hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{education.degree}{education.field ? ` in ${education.field}` : ''}</h4>
                            <button 
                              onClick={() => removeEducation(index)}
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
                  <p className="mb-6 text-gray-600 text-lg">No education entries added yet. Add education below.</p>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800">Add New Education</h4>
                  <form onSubmit={addNewEducation}>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eduDescription">
                        Description
                      </label>
                      <textarea
                        id="eduDescription"
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
                    >
                      Add Education
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Experience Tab - Unchanged except for some styling improvements */}
            {activeTab === 'experience' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Work Experience</h3>
                
                {experiences.length > 0 ? (
                  <div className="mb-8">
                    <div className="space-y-5">
                      {experiences.map((experience, index) => (
                        <div key={index} className="border-l-4 border-purple-500 pl-5 py-3 bg-gradient-to-r from-purple-50 to-white rounded-r-lg hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{experience.position}</h4>
                            <button 
                              onClick={() => removeExperience(index)}
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
                  <p className="mb-6 text-gray-600 text-lg">No work experience entries added yet. Add experience below.</p>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800">Add New Work Experience</h4>
                  <form onSubmit={addNewExperience}>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expStartDate">
                          Start Date*
                        </label>
                        <input
                          type="date"
                          id="expStartDate"
                          name="startDate"
                          value={newExperience.startDate}
                          onChange={handleExperienceChange}
                          className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expEndDate">
                          End Date (leave empty if current)
                        </label>
                        <input
                          type="date"
                          id="expEndDate"
                          name="endDate"
                          value={newExperience.endDate}
                          onChange={handleExperienceChange}
                          className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expDescription">
                        Description
                      </label>
                      <textarea
                        id="expDescription"
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
                    >
                      Add Experience
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Skills Tab - Unchanged except for some styling improvements */}
            {activeTab === 'skills' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Skills</h3>
                
                {skills.length > 0 ? (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {skills.map((skill, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-all">
                          <div>
                            <span className="font-medium text-gray-800">{skill.name}</span>
                            <div className="mt-2 flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`h-2 w-6 rounded-full ${i < skill.level ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'}`}
                                ></span>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeSkill(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mb-6 text-gray-600 text-lg">No skills added yet. Add skills below.</p>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800">Add New Skill</h4>
                  <form onSubmit={addNewSkill} className="flex flex-col md:flex-row items-end md:space-x-4">
                    <div className="flex-1 mb-4 md:mb-0">
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
                    
                    <div className="mb-4 md:mb-0 w-full md:w-48">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skillLevel">
                        Level (1-5)
                      </label>
                      <select
                        id="skillLevel"
                        name="level"
                        value={newSkill.level}
                        onChange={handleSkillChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="1">1 - Beginner</option>
                        <option value="2">2 - Elementary</option>
                        <option value="3">3 - Intermediate</option>
                        <option value="4">4 - Advanced</option>
                        <option value="5">5 - Expert</option>
                      </select>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-md w-full md:w-auto"
                    >
                      Add Skill
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Social Media Tab - Unchanged except for some styling improvements */}
            {activeTab === 'social-media' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Social Media Links</h3>
                
                {socialMediaLinks.length > 0 ? (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {socialMediaLinks.map((link, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{link.platform}</h4>
                            <button 
                              onClick={() => removeSocialMediaLink(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-3">
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              {link.url}
                            </a>
                          </div>
                          {link.iconName && (
                            <div className="mt-2 text-gray-600">
                              <span>Icon: {link.iconName}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mb-6 text-gray-600 text-lg">No social media links added yet. Add links below.</p>
                )}
                
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-bold text-xl mb-4 text-gray-800">Add New Social Media Link</h4>
                  <form onSubmit={addNewSocialMediaLink}>
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
                      <input
                        type="url"
                        id="url"
                        name="url"
                        value={newSocialMediaLink.url}
                        onChange={handleSocialMediaLinkChange}
                        className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                        placeholder="https://example.com/your-profile"
                      />
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
                    >
                      Add Social Media Link
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Final submit form */}
            <div className="border-t pt-8 mt-8">
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="group relative bg-white text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="ml-4">Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="group relative flex justify-center py-3 px-8 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-800 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                  disabled={isLoading || !formData.title || isUploading}
                >
                  {isLoading || isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span  className="ml-4 ">Create Portfolio</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCreate;