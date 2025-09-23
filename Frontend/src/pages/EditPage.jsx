import React, { useState } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';


// Helper Form Components
const InputField = ({ label, name, value, onChange, placeholder, type = "text" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus-none focus-blue-500 focus-blue-500 sm-sm" />
    </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus-none focus-blue-500 focus-blue-500 sm-sm" />
    </div>
);

// Editor Section Components
const ProfileEditor = () => {
    const { portfolio, setPortfolio } = usePortfolio();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPortfolio(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [name]: value
            }
        }));
    };
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md-cols-2 gap-6">
                <InputField label="Full Name" name="name" value={portfolio.personalInfo.name} onChange={handleChange} />
                <InputField label="Title" name="title" value={portfolio.personalInfo.title} onChange={handleChange} placeholder="e.g., Software Engineer" />
                <InputField label="Email" name="email" value={portfolio.personalInfo.email} onChange={handleChange} type="email" />
                <InputField label="Phone" name="phone" value={portfolio.personalInfo.phone} onChange={handleChange} />
                 <div className="md-span-2">
                   <InputField label="Profile Picture URL" name="profilePicture" value={portfolio.personalInfo.profilePicture} onChange={handleChange} />
                </div>
                <div className="md-span-2">
                    <TextAreaField label="Summary" name="summary" value={portfolio.personalInfo.summary} onChange={handleChange} rows={4}/>
                </div>
            </div>
        </div>
    );
}

const SocialLinksEditor = () => {
    const { portfolio, setPortfolio } = usePortfolio();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPortfolio(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [name]: value
            }
        }));
    };
    return (
        <div className="space-y-6">
            <InputField label="LinkedIn URL" name="linkedin" value={portfolio.personalInfo.linkedin} onChange={handleChange} />
            <InputField label="GitHub URL" name="github" value={portfolio.personalInfo.github} onChange={handleChange} />
        </div>
    );
}

const SkillsEditor = () => {
    const { portfolio, setPortfolio } = usePortfolio();
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        setPortfolio(prev => {
            const newSkills = [...prev.skills];
            newSkills[index] = { ...newSkills[index], [name]: value };
            return { ...prev, skills: newSkills };
        });
    };
    const addItem = () => {
        setPortfolio(prev => ({
            ...prev,
            skills: [
                ...prev.skills,
                { id: new Date().toISOString(), name: '' }
            ]
        }));
    };
    const removeItem = (index) => {
        setPortfolio(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };
    return (
        <div className="space-y-4">
            {portfolio.skills.map((skill, index) => (
                <div key={skill.id} className="flex items-end gap-3">
                    <div className="flex-grow"><InputField label={`Skill #${index + 1}`} name="name" value={skill.name} onChange={(e) => handleItemChange(index, e)} placeholder="e.g., React" /></div>
                    <button onClick={() => removeItem(index)} className="p-2 text-gray-500 hover-red-600 hover-red-50 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            ))}
            <button onClick={addItem} className="mt-4 text-blue-600 hover-blue-800 font-semibold text-sm">+ Add Skill</button>
        </div>
    );
};

const ExperienceEditor = () => {
    const { portfolio, setPortfolio } = usePortfolio();
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        setPortfolio(prev => {
            const newExperience = [...prev.experience];
            newExperience[index] = { ...newExperience[index], [name]: value };
            return { ...prev, experience: newExperience };
        });
    };
    const addItem = () => {
        setPortfolio(prev => ({
            ...prev,
            experience: [
                ...prev.experience,
                { id: new Date().toISOString(), title: '', company: '', startDate: '', endDate: '', description: '' }
            ]
        }));
    };
    const removeItem = (index) => {
        setPortfolio(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6">
            {portfolio.experience.map((exp, index) => (
                <div key={exp.id} className="p-5 border rounded-lg bg-white relative space-y-4">
                     <div className="grid grid-cols-1 md-cols-2 gap-4">
                        <InputField label="Job Title" name="title" value={exp.title} onChange={(e) => handleItemChange(index, e)} />
                        <InputField label="Company" name="company" value={exp.company} onChange={(e) => handleItemChange(index, e)} />
                        <InputField label="Start Date" name="startDate" value={exp.startDate} onChange={(e) => handleItemChange(index, e)} placeholder="e.g., Jan 2020" />
                        <InputField label="End Date" name="endDate" value={exp.endDate} onChange={(e) => handleItemChange(index, e)} placeholder="e.g., Present" />
                        <div className="md-span-2">
                            <TextAreaField label="Description" name="description" value={exp.description} onChange={(e) => handleItemChange(index, e)} />
                        </div>
                    </div>
                    <button onClick={() => removeItem(index)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover-red-600 hover-red-50 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            ))}
            <button onClick={addItem} className="mt-4 text-blue-600 hover-blue-800 font-semibold text-sm">+ Add Experience</button>
        </div>
    );
};

const ProjectsEditor = () => {
    const { portfolio, setPortfolio } = usePortfolio();
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        setPortfolio(prev => {
            const newItems = [...prev.projects];
            newItems[index] = { ...newItems[index], [name]: value };
            return { ...prev, projects: newItems };
        });
    };
    const addItem = () => {
        const id = new Date().toISOString();
        setPortfolio(prev => ({
            ...prev,
            projects: [
                ...prev.projects,
                { id, title: '', description: '', technologies: '', link: '', imageUrl: 'https://picsum.photos/seed/' + id + '/400/300' }
            ]
        }));
    };
    const removeItem = (index) => {
        setPortfolio(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6">
            {portfolio.projects.map((proj, index) => (
                 <div key={proj.id} className="p-5 border rounded-lg bg-white relative space-y-4">
                    <div className="grid grid-cols-1 md-cols-2 gap-4">
                        <InputField label="Project Title" name="title" value={proj.title} onChange={(e) => handleItemChange(index, e)} />
                        <InputField label="Technologies Used" name="technologies" value={proj.technologies} onChange={(e) => handleItemChange(index, e)} placeholder="e.g., React, Node.js" />
                        <InputField label="Project Link" name="link" value={proj.link} onChange={(e) => handleItemChange(index, e)} />
                        <InputField label="Image URL" name="imageUrl" value={proj.imageUrl} onChange={(e) => handleItemChange(index, e)} />
                        <div className="md-span-2">
                            <TextAreaField label="Description" name="description" value={proj.description} onChange={(e) => handleItemChange(index, e)} />
                        </div>
                    </div>
                    <button onClick={() => removeItem(index)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover-red-600 hover-red-50 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            ))}
            <button onClick={addItem} className="mt-4 text-blue-600 hover-blue-800 font-semibold text-sm">+ Add Project</button>
        </div>
    );
};

const EducationEditor = () => {
    const { portfolio, setPortfolio } = usePortfolio();
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        setPortfolio(prev => {
            const newItems = [...prev.education];
            newItems[index] = { ...newItems[index], [name]: value };
            return { ...prev, education: newItems };
        });
    };
    const addItem = () => {
        setPortfolio(prev => ({
            ...prev,
            education: [
                ...prev.education,
                { id: new Date().toISOString(), degree: '', institution: '', startDate: '', endDate: '' }
            ]
        }));
    };
    const removeItem = (index) => {
        setPortfolio(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };
    return (
        <div className="space-y-6">
            {portfolio.education.map((edu, index) => (
                <div key={edu.id} className="p-5 border rounded-lg bg-white relative space-y-4">
                    <div className="grid grid-cols-1 md-cols-2 gap-4">
                        <InputField label="Degree" name="degree" value={edu.degree} onChange={(e) => handleItemChange(index, e)} />
                        <InputField label="Institution" name="institution" value={edu.institution} onChange={(e) => handleItemChange(index, e)} />
                        <InputField label="Start Date" name="startDate" value={edu.startDate} onChange={(e) => handleItemChange(index, e)} placeholder="e.g., 2016" />
                        <InputField label="End Date" name="endDate" value={edu.endDate} onChange={(e) => handleItemChange(index, e)} placeholder="e.g., 2020" />
                    </div>
                     <button onClick={() => removeItem(index)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover-red-600 hover-red-50 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            ))}
            <button onClick={addItem} className="mt-4 text-blue-600 hover-blue-800 font-semibold text-sm">+ Add Education</button>
        </div>
    );
};

// Main Dashboard Component
const DashboardPage = () => {
    const { resetPortfolio } = usePortfolio();
    const [saved, setSaved] = useState(false);
    const [activeView, setActiveView] = useState('profile');

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    const sections = {
        profile: { label: 'Profile', component: <ProfileEditor /> },
        socials: { label: 'Social Links', component: <SocialLinksEditor /> },
        skills: { label: 'Skills', component: <SkillsEditor /> },
        experience: { label: 'Experience', component: <ExperienceEditor /> },
        projects: { label: 'Projects', component: <ProjectsEditor /> },
        education: { label: 'Education', component: <EducationEditor /> },
    };

    const NavItem = ({ view, label }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeView === view ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-3">
                    <button onClick={handleSave} className="inline-flex items-center bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus-none focus-2 focus-blue-500 focus-offset-2">
                        {saved ? (<><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Saved!</>) : 'Save Changes'}
                    </button>
                    <button onClick={resetPortfolio} className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover-gray-300 transition-colors duration-300">Reset</button>
                </div>
            </div>
            {saved && <div className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg text-center">Your portfolio has been saved. Changes are reflected in 'My Portfolio'.</div>}

            <div className="grid grid-cols-1 md-cols-4 gap-8">
                <aside className="md-span-1">
                    <nav className="space-y-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        {Object.entries(sections).map(([key, { label }]) => (
                            <NavItem key={key} view={key} label={label} />
                        ))}
                    </nav>
                </aside>
                <main className="md-span-3">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Edit {sections[activeView].label}</h2>
                        {sections[activeView].component}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;