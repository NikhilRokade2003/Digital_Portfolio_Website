
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link: string;
  imageUrl: string;
}

export interface Experience {
  id:string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Portfolio {
  personalInfo: {
    name: string;
    title: string;
    summary: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    profilePicture: string;
  };
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
}
