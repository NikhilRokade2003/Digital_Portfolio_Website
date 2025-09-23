import React from 'react';




const PortfolioView = ({ data }) => {
  const { personalInfo, skills, projects, experience, education } = data;

  const Icon = ({ path, className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );

  return (
    <div className="bg-white p-6 sm-10 lg-14 rounded-2xl shadow-xl border border-gray-200">
      <header className="flex flex-col sm-row items-center sm-start text-center sm-left gap-8 mb-14">
        <img src={personalInfo.profilePicture} alt={personalInfo.name} className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white" />
        <div className="flex-1">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">{personalInfo.name}</h1>
          <h2 className="text-2xl font-semibold text-blue-600 mt-1">{personalInfo.title}</h2>
          <p className="mt-4 text-gray-600 max-w-3xl leading-relaxed">{personalInfo.summary}</p>
          <div className="mt-6 flex justify-center sm-start flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
            <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 hover-blue-600 transition-colors"><Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />{personalInfo.email}</a>
            {personalInfo.phone && <span className="flex items-center gap-2"><Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />{personalInfo.phone}</span>}
            {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover-blue-600 transition-colors"><Icon path="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><path d="M4 4a2 2 0 100-4 2 2 0 000 4z" />LinkedIn</a>}
            {personalInfo.github && <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover-blue-600 transition-colors"><Icon path="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />GitHub</a>}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg-cols-3 gap-14">
        <main className="lg-span-2 space-y-14">
          <section>
            <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-8">Work Experience</h3>
            <div className="space-y-10">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xl font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-sm font-medium text-gray-500">{exp.startDate} - {exp.endDate}</p>
                  </div>
                  <p className="text-lg text-gray-700 font-medium">{exp.company}</p>
                  <p className="mt-2 text-gray-600 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-8">Projects</h3>
            <div className="grid grid-cols-1 md-cols-2 gap-8">
              {projects.map(proj => (
                <a href={proj.link} key={proj.id} className="block group bg-white rounded-xl overflow-hidden shadow-lg hover-2xl border border-gray-200 hover-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="overflow-hidden">
                    <img src={proj.imageUrl} alt={proj.title} className="w-full h-48 object-cover group-hover-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-900 group-hover-blue-600 transition-colors">{proj.title}</h4>
                    <p className="text-sm text-gray-600 mt-2">{proj.description}</p>
                    <p className="text-xs text-gray-500 mt-4 font-medium tracking-wider uppercase">{proj.technologies}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-14">
          <section>
            <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-8">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill.id} className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-md border border-blue-200">{skill.name}</span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-8">Education</h3>
            <div className="space-y-6">
              {education.map(edu => (
                <div key={edu.id}>
                  <h4 className="text-xl font-semibold text-gray-900">{edu.degree}</h4>
                  <p className="text-lg text-gray-700">{edu.institution}</p>
                  <p className="text-sm font-medium text-gray-500">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PortfolioView;