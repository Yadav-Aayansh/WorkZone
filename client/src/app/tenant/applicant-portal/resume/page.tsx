export default function ResumePage() {
  const resumeData = {
    name: 'Aarav Patel',
    title: 'Senior Frontend Developer',
    email: 'aarav.patel@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Mumbai, India',
    summary: 'Experienced Frontend Developer with 5+ years of experience in building responsive and user-friendly web applications using modern JavaScript frameworks. Passionate about creating efficient and scalable solutions with clean code.',
    experience: [
      {
        id: 1,
        role: 'Senior Frontend Developer',
        company: 'TechSolutions Inc.',
        period: '2020 - Present',
        description: 'Led a team of 5 developers to build and maintain enterprise-level applications using React and TypeScript. Improved application performance by 40% through code optimization and implementing best practices.'
      },
      {
        id: 2,
        role: 'Frontend Developer',
        company: 'WebCraft Studios',
        period: '2018 - 2020',
        description: 'Developed and maintained multiple client websites using React, Redux, and RESTful APIs. Collaborated with designers to implement responsive UIs that worked across all device sizes.'
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Master of Computer Applications',
        institution: 'Mumbai University',
        period: '2015 - 2018'
      },
      {
        id: 2,
        degree: 'Bachelor of Computer Science',
        institution: 'Pune University',
        period: '2012 - 2015'
      }
    ],
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'JavaScript', level: 90 },
      { name: 'HTML/CSS', level: 95 },
      { name: 'Node.js', level: 75 },
      { name: 'Git', level: 85 },
      { name: 'Redux', level: 80 },
      { name: 'Responsive Design', level: 90 }
    ],
    lastUpdated: '2023-10-15',
    fileUrl: '/resumes/aarav-patel-resume.pdf'
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Resume</h1>
        <p className="text-muted-foreground">
          Manage and update your resume information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Resume Preview */}
          <div className="rounded-lg border p-6 bg-white dark:bg-gray-900">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{resumeData.name}</h2>
                <p className="text-lg text-muted-foreground">{resumeData.title}</p>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span>{resumeData.email}</span>
                  <span>•</span>
                  <span>{resumeData.phone}</span>
                  <span>•</span>
                  <span>{resumeData.location}</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Summary</h3>
                <p className="text-sm">{resumeData.summary}</p>
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Experience</h3>
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="text-sm">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{exp.role}</h4>
                        <span className="text-muted-foreground">{exp.period}</span>
                      </div>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Education</h3>
                <div className="space-y-4">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="text-sm">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{edu.degree}</h4>
                        <span className="text-muted-foreground">{edu.period}</span>
                      </div>
                      <p className="text-muted-foreground">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Skills</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{skill.name}</span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-xs text-muted-foreground text-right">
                Last updated: {new Date(resumeData.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Resume Actions</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Upload New Resume</h4>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX (MAX. 5MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".pdf,.doc,.docx" />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Current Resume</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
                    </svg>
                    <span className="ml-2 text-sm">resume_aarav_patel.pdf</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 18a.969.969 0 0 0 .933 1h12.134A.97.97 0 0 0 15 18M1 7V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2v5M6 1v4a1 1 0 0 1-1 1H1m0 9v-5h1.5a.5.5 0 0 1 0 1H1m12 0v-5h1.5a.5.5 0 0 1 0 1H13m-7.5 5h3"/>
                      </svg>
                    </button>
                    <a 
                      href={resumeData.fileUrl} 
                      download 
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12V1m0 0L4 5m4-4 4 4m3 5v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                      </svg>
                    </a>
                    <button className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Parse Resume</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Extract information from your resume to auto-fill your profile.
                </p>
                <button className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Parse Resume
                </button>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Export Options</h4>
                <div className="space-y-2">
                  <button className="w-full inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    Download as PDF
                  </button>
                  <button className="w-full inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    Download as DOCX
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Resume Tips</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Keep your resume updated with your latest experience and skills.
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Use action verbs and quantify achievements where possible.
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tailor your resume for each job application.
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Keep the design clean and professional.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
