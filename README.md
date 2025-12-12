# WorkZone.tech

> Multi-tenant, Sub-domain driven, AI-Powered HR Management Platform

***IIT Madras • Academic Project • Software Engineering (BSCS3001) • Team 10***

WorkZone.tech is a multi-tenant, sub-domain driven, AI-powered HR Management Platform designed to streamline end-to-end HR operations for growing companies. It automates recruitment, employee management, learning workflows, and support processes using modern cloud technology and Generative AI. With company-specific workspaces and role-based dashboards, the system delivers a scalable and efficient HR experience.

<embed demo video here>

## 1. Project Setup



## 2. Tech Stack

| Category                           | Technologies Used |
|------------------------------------|-------------------|
| **Frontend**                       | Next.js, React, TypeScript, Turbopack, Tailwind CSS, PostCSS, shadcn/ui, Radix UI, Framer Motion, Razorpay |
| **Backend (Core)**                 | FastAPI, Python 3.12+, Uvicorn (ASGI), Pydantic |
| Database & ORM                     | PostgreSQL, SQLAlchemy (Async), Alembic, asyncpg, psycopg2-binary |
| Authentication & Security          | python-jose (JWT), bcrypt, cryptography |
| Task Queue / Background Jobs       | Celery, Redis |
| Cloud Services                     | Google Cloud Storage, Google Text-to-Speech, Google Speech-to-Text |
| AI / ML / NLP                      | Gemini (Google Generative AI), ChromaDB, spaCy, yake |
| Document Processing                | PyMuPDF, PyPDF2, pdf2image, Tesseract OCR, pytesseract, ReportLab, Pillow |
| Audio Processing                   | pydub, ffmpeg |
| **Infrastructure**                 | Docker, Redis, PostgreSQL, Tesseract OCR, ffmpeg |
| **Project Management & Productivity** | Jira, Notion, Canva, Google Drive, Git |
| **Testing**                        | Pytest |

## 3. Project Key Features

WorkZone.tech delivers a complete, AI-driven HR ecosystem designed to automate and enhance major organizational workflows. Below are the core functional components of our platform:

#### 1. Multi-Tenant Workspace System
- Each company gets its own isolated HR portal (company.workzone.tech)
- Supports custom domain mapping for a fully branded experience (hr.company.com)
- Secure, scalable architecture to enable multiple organizations on a single platform

#### 2. Admin Dashboard & Company Management
- Admin can configure company policies, leave rules, holiday calendars, and document repositories
- Manage subscription plans, billing details, and domain settings from one place
- Invite employees, managers, and recruiters and manage user roles & access

#### 3. Smart Recruitment & Documentation Automation
- Auto-generated Job Descriptions (JDs) using the Smart Document Generator
- Automated email workflows for hiring communication
- AI-powered resume ranking with detailed feedback for rejected applicants
- Recruiters get structured candidate insights for faster decision-making

#### 4. AI-Powered Interview System
- First-round screening through AI-driven interviews (audio + text modes available) for quick candidate filtering
- Automatic question generation based on JD + resume
- Ask dynamic, follow-up questions based on candidate responses
- Generates structured evaluation summaries for recruiters

#### 5. Employee Dashboard & Personalized Learning
- Employees get a role-based dashboard tailored to their needs
- Personalized Learning Path Generator recommends relevant courses & skill upgrades
- Supports continuous upskilling and career development

#### 6. AI Helpdesk & Query Ticketing
- Chatbot answers HR policy–related questions instantly using GenAI
- If the employee is not satisfied, they can raise a support ticket
- Ticket routes to the recruiter/HR team for manual resolution

## 4. Documentation

All project documentation is available on Notion.

**Notion Docs Home:** [WorkZone.tech - Project Documentation Hub](https://workzone-tech.notion.site/Project-Documentation-Hub-2af2b8868d2e80cf913bcc68285b2c87)

The workspace includes milestone reports, MOMs, problem statements, demo video links, client presentation slides, team contribution details and all other project-related resources.

## 5. About

We are students of the IIT Madras BS Degree program, and this project was developed as part of the Software Engineering course (BSCS3001).

**Team Details**

| Roll No.   | Name                | Role                            | Contacts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21F3002290 | Mayank Tripathi     | Product Lead                    | <a href="https://github.com/mayanktripathii" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/mayanktripathi10" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a>     |
| 22F3000694 | Achal Deep          | AI Product Manager              | <a href="https://github.com/achaldeep" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/achaldeep" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a>                  |
| 23F2001154 | Sandesh Apparala    | Frontend Lead & Experience Architect              | <a href="https://github.com/sandeshapparala" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/sandeshapparala" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a>                    |
| 22F3000803 | Abhishek Pandey     | Frontend Developer              | <a href="https://github.com/Avi-11007" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/abhishek-pandey-21944324a" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 23F2003711 | Aayansh Yadav       | Backend Lead & System Architect | <a href="https://github.com/Yadav-Aayansh" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/Yadav-Aayansh" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a>          |
| 22F1000589 | Rishab Panwar       | GenAI Developer                 | <a href="https://github.com/rishab-panwar" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/rishab-panwar3000" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a>      |
| 22F3001229 | Shreyas Jani        | AI & Automation Engineer        | <a href="https://github.com/JaniShreyas" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/janishreyas" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a>                    |
| 22F1000926 | Raghav Rao Ghanathe | QA Engineer                     | <a href="https://github.com/raghav42513" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/raghav-rao-ghanathe" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a>      |

## 6. Contributing

We welcome contributions!
You can:

- Report Issues
- Suggest features
- Submit PRs
- Contact any team member for collaboration

## 7. License

This project is licensed under the MIT License.
You may use, modify, and distribute it with proper attribution.

---

## Made with dedication by Team 10

Building the future of HR with AI-powered automation.

For feedback, suggestions, or collaboration, feel free to connect with us!
