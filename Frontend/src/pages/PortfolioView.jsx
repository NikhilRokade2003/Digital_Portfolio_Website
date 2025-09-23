import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { portfolioAPI } from '../../services/api';
import { authAPI } from '../../services/api';
import html2pdf from 'html2pdf.js';

const PortfolioView = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	
	const [portfolio, setPortfolio] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [isOwner, setIsOwner] = useState(false);
	const [activeSection, setActiveSection] = useState('about');
	const [isPdfLoading, setIsPdfLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef(null);
	const printRef = useRef(null);
	// Handle profile image file selection and upload
	const handleProfileImageChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			setError('Image size should be less than 5MB');
			return;
		}
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const response = await fetch('http://localhost:5163/api/ImageUpload/profile', {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});
			if (!response.ok) throw new Error('Image upload failed');
			const data = await response.json();
			const imageUrl = data.url.startsWith('http') ? data.url : `http://localhost:5163${data.url}`;
			setPortfolio((prev) => ({ ...prev, profileImage: imageUrl }));
			setError('');
		} catch (err) {
			setError('Failed to upload profile image. Please try again.');
		} finally {
			setIsUploading(false);
		}
	};
	
	// Auth state
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		checkAuth();
		fetchPortfolio();
	}, [id]);
	
	const checkAuth = async () => {
		try {
			const isLoggedIn = await authAPI.isAuthenticated();
			setIsAuthenticated(isLoggedIn);
		} catch (err) {
			console.error('Error checking authentication:', err);
			setIsAuthenticated(false);
		}
	};

	const fetchPortfolio = async () => {
		try {
			setIsLoading(true);
			const response = await portfolioAPI.getPortfolio(id);
			setPortfolio(response.data);
			
			// Check if the current user is the owner of this portfolio
			const token = localStorage.getItem('token');
			if (token) {
				try {
					const myPortfoliosResponse = await portfolioAPI.getMyPortfolios();
					const isOwner = myPortfoliosResponse.data.some(p => p.id === parseInt(id));
					setIsOwner(isOwner);
				} catch (err) {
					console.log('Not the owner or not logged in');
					setIsOwner(false);
				}
			}
		} catch (err) {
			console.error('Error fetching portfolio:', err);
			setError('Failed to load portfolio. It might not exist or you may not have permission to view it.');
			
			// If not found, redirect to public portfolios
			if (err.response?.status === 404) {
				setTimeout(() => navigate('/portfolios'), 3000);
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Handle edit button click
	const handleEditClick = async (e) => {
		e.preventDefault();
		
		try {
			// Check if user is authenticated before allowing edit
			const isAuthenticated = await authAPI.isAuthenticated();
			if (isAuthenticated) {
				navigate(`/portfolio/edit/${id}`);
			} else {
				navigate('/login');
			}
		} catch (error) {
			console.error('Error checking authentication:', error);
			navigate('/login');
		}
	};

	// Handle professional PDF download
	const handleDownloadPdf = async () => {
		try {
			setIsPdfLoading(true);
			
			// Call the professional PDF endpoint
			const response = await fetch(`http://localhost:5163/api/Portfolio/${id}/pdf`, {
				method: 'GET',
				credentials: 'include', // Include authentication if needed
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Get the filename from the response headers
			const contentDisposition = response.headers.get('content-disposition');
			let filename = `Portfoliofy-Portfolio-${new Date().toISOString().split('T')[0]}.html`;
			
			if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
				filename = contentDisposition
					.split('filename=')[1]
					.split(';')[0]
					.replace(/"/g, '');
			}

			// Create blob and download
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			
			// Cleanup
			window.URL.revokeObjectURL(url);
			document.body.removeChild(link);

		} catch (error) {
			console.error('Error downloading PDF:', error);
			setError('Failed to download portfolio PDF. Please try again.');
		} finally {
			setIsPdfLoading(false);
		}
	};

	// Helper function to handle image URLs
	const formatImageUrl = (url) => {
		if (!url) return 'https://via.placeholder.com/300';
		if (url.startsWith('http')) return url;
		return `http://localhost:5163${url}`;
	};

	// Helper function to render social media icon
	const getSocialMediaIcon = (iconName) => {
		switch(iconName?.toLowerCase()) {
			case 'linkedin':
				return (
					<svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
					</svg>
				);
			case 'github':
				return (
					<svg className="w-5 h-5 text-secondary-800" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
				);
			case 'twitter':
			case 'x':
				return (
					<svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
					</svg>
				);
			case 'facebook':
				return (
					<svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
					</svg>
				);
			case 'instagram':
				return (
					<svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
					</svg>
				);
			case 'website':
				return (
					<svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9"/>
					</svg>
				);
			default:
				return (
					<svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
					</svg>
				);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-secondary-50">
				<Navigation />
				<div className="container mx-auto px-4 py-16 text-center">
					<div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
					<p className="mt-4 text-secondary-700 font-medium">Loading portfolio...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-secondary-50">
				<Navigation />
				<div className="container mx-auto px-4 py-16">
					<div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-soft max-w-lg mx-auto">
						<div className="flex items-center">
							<svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							<p>{error}</p>
						</div>
					</div>
					<div className="text-center mt-6">
						<p className="text-secondary-600 mb-4">Redirecting you to public portfolios...</p>
						<Link 
							to="/portfolios" 
							className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300 shadow-soft"
						>
							Browse Portfolios
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!portfolio) {
		return (
			<div className="min-h-screen bg-secondary-50">
				<Navigation />
				<div className="container mx-auto px-4 py-16 text-center">
					<p className="text-lg text-secondary-700">No portfolio found.</p>
					<Link 
						to="/portfolios" 
						className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300 shadow-soft mt-4 inline-block"
					>
						Browse Portfolios
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden">
			<Navigation />
			{/* Enhanced Animated Background Elements */}
			<div className="absolute inset-0 z-1 pointer-events-none">
				<div className="live-wallpaper-shape live-wallpaper-1 opacity-20"></div>
				<div className="live-wallpaper-shape live-wallpaper-2 opacity-15"></div>
				<div className="live-wallpaper-shape live-wallpaper-3 opacity-20"></div>
				<div className="floating-particles opacity-30">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="particle"></div>
					))}
				</div>
				<div className="aurora opacity-25"></div>
			</div>
			<div className="relative z-10 container mx-auto px-4 py-12">
				<div ref={printRef} className="bg-gradient-to-br from-violet-50 via-pink-50 via-white via-purple-100 via-neutral-50 to-blue-50 rounded-3xl shadow-2xl border border-secondary-100 p-8">
				{/* Portfolio header section */}
				<div className="bg-gradient-to-br from-violet-50 via-pink-50 via-white via-purple-100 via-neutral-50 to-blue-50 rounded-lg shadow-medium overflow-hidden mb-8">
					<div className="bg-primary-700 h-2"></div>
					<div className="p-8">
						<div className="flex justify-between items-start flex-wrap gap-4">
							<h1 className="text-3xl sm:text-4xl font-bold text-secondary-900">{portfolio.title}</h1>
							
							<div className="flex flex-wrap gap-3">
								<button 
									onClick={handleDownloadPdf}
									disabled={isPdfLoading}
									className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-md font-medium transition-all duration-300 shadow-soft ${isPdfLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}`}
									title="Download your portfolio as a professional PDF"
								>
									{isPdfLoading ? (
										<span className="flex items-center">
											<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Generating PDF...
										</span>
									) : (
										<span className="flex items-center">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											Download Portfolio
										</span>
									)}
								</button>
								
								{isOwner && !isLoading && (
									<button 
										onClick={handleEditClick}
										className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-300 shadow-soft flex items-center"
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										Edit Portfolio
									</button>
								)}
							</div>
						</div>
						
						<div className="flex flex-col md:flex-row gap-8 mt-8">
							<div className="md:w-1/3 flex flex-col items-center">
								<div className="h-48 w-48 rounded-full overflow-hidden border-4 border-secondary-200 shadow-medium bg-secondary-100 flex items-center justify-center">
									{portfolio.profileImage ? (
										<img 
											src={formatImageUrl(portfolio.profileImage)} 
											alt={`${portfolio.userFullName}'s profile`} 
											className="object-cover w-full h-full"
											crossOrigin="anonymous"
										/>
									) : (
										<span className="text-6xl font-bold text-secondary-300">
											{portfolio.userFullName ? portfolio.userFullName.charAt(0) : "U"}
										</span>
									)}
								</div>
								{isOwner && (
									<>
										<input
											type="file"
											accept="image/*"
											ref={fileInputRef}
											style={{ display: 'none' }}
											onChange={handleProfileImageChange}
										/>
										<button
											onClick={() => fileInputRef.current && fileInputRef.current.click()}
											className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition-colors duration-200 text-sm font-medium"
											disabled={isUploading}
										>
											{isUploading ? 'Uploading...' : (portfolio.profileImage ? 'Change Profile Picture' : 'Add Profile Picture')}
										</button>
									</>
								)}
							</div>
							
							<div className="md:w-2/3">
								<h2 className="text-2xl font-bold mb-2 text-secondary-800">{portfolio.userFullName}</h2>
								
								<div className="mb-4 text-secondary-600">
									{portfolio.user?.email && (
										<div className="flex items-center mb-2">
											<svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
											</svg>
											<span>{portfolio.user.email}</span>
										</div>
									)}
									{portfolio.email && (
										<div className="flex items-center mb-2">
											<svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
											</svg>
											<span>{portfolio.email}</span>
										</div>
									)}
									{portfolio.phone && (
										<div className="flex items-center mb-2">
											<svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
											</svg>
											<span>{portfolio.phone}</span>
										</div>
									)}
									{(portfolio.city || portfolio.country) && (
										<div className="flex items-center mb-2">
											<svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
											</svg>
											<span>{[portfolio.city, portfolio.country].filter(Boolean).join(', ')}</span>
										</div>
									)}
								</div>
								
								{/* Social media links - Check visibility */}
								{portfolio.socialMediaLinks && portfolio.socialMediaLinks.length > 0 && (isOwner || portfolio.isSocialMediaPublic) && (
									<div className="mb-4">
										<div className="flex flex-wrap items-center gap-4">
											{portfolio.socialMediaLinks.map(link => (
												<a 
													key={link.id}
													href={link.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-secondary-600 hover:text-primary-600 transition-colors flex items-center gap-1"
													title={link.platform}
												>
													<span className="sr-only">{link.platform}</span>
													{getSocialMediaIcon(link.iconName)}
													<span className="text-sm font-medium">{link.platform}</span>
												</a>
											))}
										</div>
									</div>
								)}
								
								<div className="text-secondary-500 text-sm">
									<p>Last updated: {new Date(portfolio.updatedAt).toLocaleDateString()}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				{/* Portfolio content tabs */}
				<div className="bg-gradient-to-br from-violet-50 via-pink-50 via-white via-purple-100 via-neutral-50 to-blue-50 rounded-lg shadow-medium overflow-hidden">
					<div className="border-b border-secondary-200">
						<nav className="flex flex-wrap">
							<button
								className={`px-6 py-4 border-b-2 ${
									activeSection === 'about' ? 'border-primary-600 text-primary-700 font-medium' : 'border-transparent hover:border-secondary-300 text-secondary-600 hover:text-secondary-900'
								} transition-all duration-200`}
								onClick={() => setActiveSection('about')}
							>
								About
							</button>
							<button
								className={`px-6 py-4 border-b-2 ${
									activeSection === 'projects' ? 'border-primary-600 text-primary-700 font-medium' : 'border-transparent hover:border-secondary-300 text-secondary-600 hover:text-secondary-900'
								} transition-all duration-200`}
								onClick={() => setActiveSection('projects')}
							>
								Projects
							</button>
							<button
								className={`px-6 py-4 border-b-2 ${
									activeSection === 'education' ? 'border-primary-600 text-primary-700 font-medium' : 'border-transparent hover:border-secondary-300 text-secondary-600 hover:text-secondary-900'
								} transition-all duration-200`}
								onClick={() => setActiveSection('education')}
							>
								Education
							</button>
							<button
								className={`px-6 py-4 border-b-2 ${
									activeSection === 'experience' ? 'border-primary-600 text-primary-700 font-medium' : 'border-transparent hover:border-secondary-300 text-secondary-600 hover:text-secondary-900'
								} transition-all duration-200`}
								onClick={() => setActiveSection('experience')}
							>
								Experience
							</button>
							<button
								className={`px-6 py-4 border-b-2 ${
									activeSection === 'skills' ? 'border-primary-600 text-primary-700 font-medium' : 'border-transparent hover:border-secondary-300 text-secondary-600 hover:text-secondary-900'
								} transition-all duration-200`}
								onClick={() => setActiveSection('skills')}
							>
								Skills
							</button>
						</nav>
					</div>
					
					{/* Tab content */}
					<div className="p-8">
						{/* About section */}
						{activeSection === 'about' && (
							<div>
								<h3 className="text-2xl font-bold mb-4 text-secondary-900">About Me</h3>
								<div className="text-lg text-secondary-700 leading-relaxed prose max-w-none">
									{portfolio.description || 'No description provided.'}
								</div>
							</div>
						)}
						
						{/* Projects section - Check visibility */}
						{activeSection === 'projects' && (
							<div>
								<h3 className="text-2xl font-bold mb-6 text-secondary-900">Projects</h3>
								{isOwner || portfolio.isProjectsPublic ? (
									portfolio.projects && portfolio.projects.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{portfolio.projects.map(project => (
												<div key={project.id} className="bg-white rounded-lg shadow-soft overflow-hidden border border-secondary-100 transition-all hover:shadow-medium">
													{project.imageUrl && (
														<div className="h-52 overflow-hidden">
															<img 
																src={formatImageUrl(project.imageUrl)} 
																alt={project.title} 
																className="w-full h-full object-cover"
																crossOrigin="anonymous"
															/>
														</div>
													)}
													<div className="p-6">
														<h4 className="font-bold text-xl mb-3 text-secondary-900">{project.title}</h4>
														<p className="text-secondary-600 mb-4 leading-relaxed">{project.description}</p>
														{project.projectUrl && (
															<a 
																href={project.projectUrl} 
																target="_blank" 
																rel="noopener noreferrer"
																className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-300 shadow-soft inline-flex items-center"
															>
																<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
																</svg>
																View Project
																</a>
														)}
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-secondary-600 text-lg">No projects added yet.</p>
									)
								) : (
									<div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
										<div className="flex items-center text-secondary-700">
											<svg className="w-6 h-6 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
											<p>The projects section of this portfolio is private.</p>
										</div>
									</div>
								)}
							</div>
						)}
						
						{/* Education section - Check visibility */}
						{activeSection === 'education' && (
							<div>
								<h3 className="text-2xl font-bold mb-6 text-secondary-900">Education</h3>
								{isOwner || portfolio.isEducationPublic ? (
									portfolio.educations && portfolio.educations.length > 0 ? (
										<div className="space-y-6">
											{portfolio.educations.map(education => (
												<div key={education.id} className="border-l-4 border-primary-500 pl-6 py-2 bg-secondary-50 rounded-r-lg transition-all">
													<h4 className="font-bold text-xl text-secondary-900">{education.degree}{education.field ? ` in ${education.field}` : ''}</h4>
													<p className="font-medium text-lg text-secondary-800 mt-1">{education.institution}</p>
													<p className="text-primary-600 mt-2 flex items-center text-sm">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m-6 0v10a2 2 0 002 2h2a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" />
														</svg>
														{new Date(education.startDate).toLocaleDateString()} - 
														{education.endDate ? new Date(education.endDate).toLocaleDateString() : ' Present'}
													</p>
													{education.description && (
														<p className="mt-3 text-secondary-700 leading-relaxed">{education.description}</p>
													)}
												</div>
											))}
										</div>
									) : (
										<p className="text-secondary-600 text-lg">No education information added yet.</p>
									)
								) : (
									<div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
										<div className="flex items-center text-secondary-700">
											<svg className="w-6 h-6 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
											<p>The education section of this portfolio is private.</p>
										</div>
									</div>
								)}
							</div>
						)}
						
						{/* Experience section - Check visibility */}
						{activeSection === 'experience' && (
							<div>
								<h3 className="text-2xl font-bold mb-6 text-secondary-900">Work Experience</h3>
								{isOwner || portfolio.isExperiencePublic ? (
									portfolio.experiences && portfolio.experiences.length > 0 ? (
										<div className="space-y-6">
											{portfolio.experiences.map(experience => (
												<div key={experience.id} className="border-l-4 border-primary-500 pl-6 py-2 bg-secondary-50 rounded-r-lg transition-all">
													<h4 className="font-bold text-xl text-secondary-900">{experience.position}</h4>
													<p className="font-medium text-lg text-secondary-800 mt-1">{experience.company}{experience.location ? ` - ${experience.location}` : ''}</p>
													<p className="text-primary-600 mt-2 flex items-center text-sm">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m-6 0v10a2 2 0 002 2h2a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" />
														</svg>
														{new Date(experience.startDate).toLocaleDateString()} - 
														{experience.endDate ? new Date(experience.endDate).toLocaleDateString() : ' Present'}
													</p>
													{experience.description && (
														<p className="mt-3 text-secondary-700 leading-relaxed">{experience.description}</p>
													)}
												</div>
											))}
										</div>
									) : (
										<p className="text-secondary-600 text-lg">No work experience added yet.</p>
									)
								) : (
									<div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
										<div className="flex items-center text-secondary-700">
											<svg className="w-6 h-6 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
											<p>The experience section of this portfolio is private.</p>
										</div>
									</div>
								)}
							</div>
						)}
						
						{/* Skills section - Check visibility */}
						{activeSection === 'skills' && (
							<div>
								<h3 className="text-2xl font-bold mb-6 text-secondary-900">Skills</h3>
								{isOwner || portfolio.isSkillsPublic ? (
									portfolio.skills && portfolio.skills.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{portfolio.skills.map(skill => (
												<div key={skill.id} className="bg-white rounded-lg shadow-soft overflow-hidden border border-secondary-100 p-5">
													<h4 className="font-bold text-lg text-secondary-900 mb-3">{skill.name}</h4>
													<div className="flex items-center">
														<div className="w-full bg-secondary-200 rounded-full h-2.5 mr-2">
															<div 
																className="bg-primary-600 h-2.5 rounded-full" 
																style={{ width: `${(skill.level / 5) * 100}%` }}
															></div>
														</div>
														<span className="text-sm font-medium text-secondary-700">{skill.level}/5</span>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-secondary-600 text-lg">No skills added yet.</p>
									)
								) : (
									<div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
										<div className="flex items-center text-secondary-700">
											<svg className="w-6 h-6 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
											<p>The skills section of this portfolio is private.</p>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
				</div>
			</div>
		</div>
	);
};

export default PortfolioView;