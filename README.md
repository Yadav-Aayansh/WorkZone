# WorkZone.tech
> Multi-tenant, Sub-domain driven, AI-Powered HR Management Platform

***IIT Madras • Academic Project • Software Engineering (BSCS3001) • Team 10***

#### Project Demo

<Embed demo video here>

#### Table of Contents

1. [Project Overview](#1-project-overview)
   - [Key Features](#11-key-features)
2. [Documentation](#2-documentation)
3. [Tech Stack](#3-tech-stack)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Infrastructure](#infrastructure)
   - [Deployment & Productivity Tools](#deployment--productivity-tools)
4. [Project Setup](#4-project-setup)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
   - [Scripts](#scripts)
   - [API Documentation](#api-documentation)
5. [About](#5-about)
6. [Contributing](#6-contributing)
7. [License](#7-license)

</details>

## 1. Project Overview

WorkZone.tech is a multi-tenant, AI-powered HR Management Platform built to streamline and automate end-to-end human resource operations for startups and mid-sized companies. <br>
With dedicated company subdomains, intelligent automation, and role-specific dashboards, the platform enables organizations to run their HR processes with greater efficiency, accuracy, and scalability. <br>
Traditional HR systems are either too manual, too costly, or lack AI-driven insights. WorkZone.tech bridges this gap by offering an accessible, cloud-based solution powered by modern technologies and Generative AI.

The system manages the complete employee lifecycle, right from recruitment and onboarding to performance evaluation and communication. It also provides real-time insights and intelligent automation to help companies operate more efficiently.

#### Key Highlights

- Multi-tenant HR workspaces with custom domain options for a fully branded experience (e.g., `<company>.workzone.tech`, `hr.<company.com>`).
- AI-powered recruitment workflows including resume ranking and automated applicant feedback.
- AI Interview System for first-round audio-based screening, generating structured evaluation summaries for recruiters.
- Smart HR document generation for emails, job descriptions (JDs), and feedback reports.
- AI Helpdesk with an integrated Query Ticketing System for smooth and reliable employee support.
- Personalized Learning Path Generator to support continuous employee upskilling.
- Streamlined operations for employees, managers, and recruiters through role-based dashboards.

## 2. Documentation

All project documentation is available on Notion.

**Notion Docs Home:** [WorkZone.tech - Project Documentation Hub](https://workzone-tech.notion.site/Project-Documentation-Hub-2af2b8868d2e80cf913bcc68285b2c87)

The workspace includes milestone reports, MOMs, problem statements, demo video links, client presentation slides, team contribution details and all other project-related resources.

## 3. Tech Stack

### Frontend

<p> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/> <img src="https://img.shields.io/badge/Turbopack-000000?style=for-the-badge&logo=vercel&logoColor=white"/> <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white"/> <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge"/> <img src="https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white"/> <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white"/> <img src="https://img.shields.io/badge/Razorpay-0C55E9?style=for-the-badge&logo=razorpay&logoColor=white"/> </p>

### Backend 

<p> <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/> <img src="https://img.shields.io/badge/Python_3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white"/> <img src="https://img.shields.io/badge/Uvicorn-ASGI-4B8BBE?style=for-the-badge"/> <img src="https://img.shields.io/badge/Pydantic-v2-0F6BFF?style=for-the-badge"/> </p>

**Database & ORM**
<p> <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/> <img src="https://img.shields.io/badge/SQLAlchemy_Async-DA3B01?style=for-the-badge"/> <img src="https://img.shields.io/badge/Alembic-Migrations-233D4D?style=for-the-badge"/> </p>

**Authentication & SecurityJ**
<p> <img src="https://img.shields.io/badge/JWT-python--jose-000000?style=for-the-badge"/> <img src="https://img.shields.io/badge/bcrypt-338?style=for-the-badge"/> <img src="https://img.shields.io/badge/cryptography-333333?style=for-the-badge"/> </p>

**Task Queue & Background Jobs**
<p> <img src="https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white"/> <img src="https://img.shields.io/badge/Redis-D92C2C?style=for-the-badge&logo=redis&logoColor=white"/> </p>

**Cloud Services**
<p> <img src="https://img.shields.io/badge/Google_Cloud_Storage-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white"/> <img src="https://img.shields.io/badge/Google_TTS-34A853?style=for-the-badge"/> <img src="https://img.shields.io/badge/Google_STT-FBBC05?style=for-the-badge"/> </p>

**AI / ML & NLP**
<p> <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white"/> <img src="https://img.shields.io/badge/ChromaDB-000000?style=for-the-badge"/> <img src="https://img.shields.io/badge/spaCy-09A3D5?style=for-the-badge&logo=spacy&logoColor=white"/> <img src="https://img.shields.io/badge/yake-FF8800?style=for-the-badge"/> </p>

**Document Processing Pipeline**
<p> <img src="https://img.shields.io/badge/PyMuPDF-F44336?style=for-the-badge"/> <img src="https://img.shields.io/badge/PyPDF2-003B57?style=for-the-badge"/> <img src="https://img.shields.io/badge/pdf2image-444444?style=for-the-badge"/> <img src="https://img.shields.io/badge/Tesseract_OCR-008000?style=for-the-badge&logo=tesseract&logoColor=white"/> <img src="https://img.shields.io/badge/Pillow-569AA6?style=for-the-badge"/> <img src="https://img.shields.io/badge/ReportLab-795548?style=for-the-badge"/> </p>

**Audio Processing**
<p> <img src="https://img.shields.io/badge/pydub-FF5722?style=for-the-badge"/> <img src="https://img.shields.io/badge/ffmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white"/> </p>

### Infrastructure

<p> <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/> <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/> <img src="https://img.shields.io/badge/Redis-D92C2C?style=for-the-badge&logo=redis&logoColor=white"/> </p>

### Deployment & Productivity Tools

<p> <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"/> <img src="https://img.shields.io/badge/Pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white"/> <img src="https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white"/> <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white"/> <img src="https://img.shields.io/badge/Google_Drive-34A853?style=for-the-badge&logo=googledrive&logoColor=white"/> <img src="https://img.shields.io/badge/Canva-00C4CC?style=for-the-badge&logo=canva&logoColor=white"/> <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/> </p>

## 4. Project Setup

### Prerequisites

* Node.js 18+ & pnpm
* Python 3.12+ & uv
* PostgreSQL 12+
* Redis
* Tesseract OCR & ffmpeg

### Installation

#### Backend

```bash
cd server
uv sync
uv run alembic upgrade head
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd client
npm install
npm dev
```

### Environment Variables

#### Server (`server/.env`)

```env
SYNC_DATABASE_URL=
ASYNC_DATABASE_URL=
FRONTEND_URL=https://workzone.tech
SERVER_IP=
GOOGLE_API_KEY=
GROQ_API_KEY=
LOG_LEVEL=INFO
GOOGLE_PROJECT_ID=
GOOGLE_PRIVATE_KEY=
GOOGLE_CLIENT_EMAIL=
GCS_BUCKET_NAME=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
DOMAIN_NAME=workzone.tech
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
REDIS_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_NAME=Workzone
SMTP_USER=
SMTP_PASSWORD=
```

#### Client (`client/.env.local`)

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_PLATFORM_URL=http://workzone.tech
NEXT_PUBLIC_DOMAIN_NAME=workzone.tech
NEXT_PUBLIC_GCS_BUCKET_NAME=
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm dev` | Start frontend dev server |
| `npm build` | Build frontend for production |
| `uv run uvicorn src.main:app --reload` | Start backend dev server |
| `uv run alembic upgrade head` | Run database migrations |

### API Documentation

* Swagger UI: `http://localhost:8000/api/docs`
* ReDoc: `http://localhost:8000/api/redoc`

## 5. About

We all are student of IIT Madras BS Degree, we did this project as part of our course Software Engineering (BSCS3001). 

**Team Details**

| Roll No.     | Name                  | Role               | Contacts |
|--------------|------------------------|--------------------|----------|
| 21F3002290   | Mayank Tripathi        | Product Lead       | <a href="https://github.com/mayanktripathii" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/mayanktripathi10" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 22F3000694   | Achal Deep             | AI Product Manager    | <a href="https://github.com/achaldeep" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/achaldeep" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 23F2001154   | Sandesh Apparala       | Frontend Developer | <a href="https://github.com/username" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/username" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 22F3000803   | Abhishek Pandey        | Frontend Developer | <a href="https://github.com/username" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/username" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 23F2003711   | Aayansh Yadav          | Backend Lead & System Architect  | <a href="https://github.com/username" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/username" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 22F1000589   | Rishab Panwar          | GenAI Developer     | <a href="https://github.com/rishab-panwar" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/rishab-panwar3000" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 22F3001229  | Shreyas Jani           | AI & Automation Engineer | <a href="https://github.com/username" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/username" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |
| 22F1000926  | Raghav Rao Ghanathe    | QA Engineer        | <a href="https://github.com/username" target="_blank"><img src="https://store-images.s-microsoft.com/image/apps.18073.7ab38b27-6fcf-43cf-ade7-391a5e6e3c35.0c5d870c-9aac-4f02-9e2c-f2f5be6de053.3954d5b9-ffce-4978-bbdd-73c83ff0f39f" width="20"/></a> <a href="https://linkedin.com/in/username" target="_blank"><img src="https://img.freepik.com/premium-psd/linkedin-icon-isolated-white-background-letter-logotype-social-media-app-round-button-logo_989822-4604.jpg" width="20"/></a> |

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
