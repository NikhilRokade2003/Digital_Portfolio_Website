// Example data for portfolio showcase
export const examplePortfolios = [
  {
    personalInfo: {
      name: 'Alex Doe',
      title: 'Full Stack Developer',
      email: 'alex@example.com',
      phone: '123-456-7890',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      summary: 'Experienced developer with a passion for building beautiful web apps.',
      linkedin: 'https://linkedin.com/in/alexdoe',
      github: 'https://github.com/alexdoe',
    },
    skills: [
      { id: '1', name: 'React' },
      { id: '2', name: 'Node.js' },
      { id: '3', name: 'CSS' },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Portfolio Website',
        description: 'A personal portfolio website to showcase my work.',
        technologies: 'React, Tailwind CSS',
        link: 'https://alexdoe.dev',
        imageUrl: 'https://picsum.photos/seed/p1/400/300',
      },
    ],
    experience: [
      {
        id: 'e1',
        title: 'Frontend Developer',
        company: 'Tech Solutions',
        startDate: 'Jan 2021',
        endDate: 'Present',
        description: 'Developed and maintained web applications using React and Redux.'
      },
    ],
    education: [
      {
        id: 'ed1',
        degree: 'B.Sc. Computer Science',
        institution: 'State University',
        startDate: '2016',
        endDate: '2020',
      },
    ],
  },
  // Add more example portfolios as needed
];
