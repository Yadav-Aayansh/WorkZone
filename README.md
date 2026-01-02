# WorkZone.tech

> Multi-tenant, Sub-domain driven, AI-Powered HR Management Platform

***IIT Madras • Academic Project • Software Engineering (BSCS3001) • Team 10***

WorkZone.tech is a multi-tenant, sub-domain driven, AI-powered HR Management Platform designed to streamline end-to-end HR operations for growing companies. It automates recruitment, employee management, learning workflows, and support processes using modern cloud technology and Generative AI. With company-specific workspaces and role-based dashboards, the system delivers a scalable and efficient HR experience.

<embed demo video here>

## Workzone Setup & Deployment

### Prerequisites
- Python 3.11+ with `uv`
- Node.js 18+
- Docker (for ChromaDB)
- Cloud PostgreSQL (GCP Cloud SQL / AWS RDS / Supabase)
- Cloud Redis (GCP Memorystore / AWS ElastiCache / Upstash)
- Go 1.25+ (production only)
- Cloudflare domain

---

## Local Development

### 1. Environment Setup
```bash
# Backend
cp server/.env.example server/.env
nano server/.env

# Frontend
cp client/.env.local.example client/.env.local
nano client/.env.local
```

**server/.env:**
```ini
SERVER_IP=localhost
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=INFO

# Cloud Database
SYNC_DATABASE_URL=postgresql://user:pass@cloud-host:5432/workzone
ASYNC_DATABASE_URL=postgresql+asyncpg://user:pass@cloud-host:5432/workzone

# Cloud Redis
REDIS_URL=redis://:password@cloud-host:6379/0

# ChromaDB (local)
CHROMA_HOST=localhost
CHROMA_PORT=8001

# Google Cloud
GOOGLE_PROJECT_ID=your-project
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GOOGLE_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
GCS_BUCKET_NAME=your-bucket

# LLM
GOOGLE_API_KEY=your-key

# JWT
JWT_SECRET_KEY=your-64-char-secret
JWT_ALGORITHM=HS256

DOMAIN_NAME=localhost

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=secret
RAZORPAY_WEBHOOK_SECRET=webhook-secret

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_NAME=Workzone
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password
```

**client/.env.local:**
```ini
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN_NAME=localhost
NEXT_PUBLIC_GCS_BUCKET_NAME=your-bucket
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 2. Install Dependencies
```bash
# Backend
cd server && uv sync

# Frontend
cd client && npm install
```

### 3. Database Migrations
```bash
cd server
uv run alembic -c alembic.ini upgrade head
uv run alembic -c alembic_tenant.ini upgrade head
```

### 4. ChromaDB (Docker)
```bash
docker run -d \
    --name chromadb \
    --restart always \
    -p 8001:8000 \
    -v $(pwd)/chroma_data:/chroma/chroma \
    chromadb/chroma
```

### 5. Run Services
```bash
# Terminal 1 - Backend
cd server
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Celery
cd server
celery -A src.core.celery worker --loglevel=info

# Terminal 3 - Frontend
cd client
npm run dev
```

---

## Production Deployment (GCP VM)

### 1. Server Setup
```bash
# SSH into VM
ssh user@vm-ip

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs git docker.io
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc

# Clone repo
git clone YOUR_REPO workzone
cd workzone
```

### 2. Environment Config
```bash
nano server/.env
```
Use production values (cloud DB URLs, production keys, domain: `YOUR_DOMAIN.com`)

```bash
nano client/.env.local
```
Use production URLs (`https://YOUR_DOMAIN.com`)

### 3. Database Migrations
```bash
cd server
uv run alembic -c alembic.ini upgrade head
uv run alembic -c alembic_tenant.ini upgrade head
```

### 4. Build Frontend
```bash
cd client
npm install --production
npm run build
```

### 5. ChromaDB (Docker)
```bash
cd ~
sudo docker run -d \
    --name chromadb \
    --restart always \
    -p 8001:8000 \
    -v ~/chroma_data:/chroma/chroma \
    chromadb/chroma
```

### 6. Systemd Services

Create log directory:
```bash
sudo mkdir -p /var/log/workzone
sudo chown $USER:$USER /var/log/workzone
```

#### Backend Service
```bash
sudo nano /etc/systemd/system/workzone-backend.service
```
```ini
[Unit]
Description=Workzone Backend
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/workzone/server
Environment="PATH=/home/YOUR_USERNAME/workzone/server/.venv/bin:/usr/bin"
ExecStart=/home/YOUR_USERNAME/workzone/server/.venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=on-failure
StandardOutput=append:/var/log/workzone/backend.log
StandardError=append:/var/log/workzone/backend.log

[Install]
WantedBy=multi-user.target
```

#### Celery Service
```bash
sudo nano /etc/systemd/system/workzone-celery.service
```
```ini
[Unit]
Description=Workzone Celery
After=network.target workzone-backend.service

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/workzone/server
Environment="PATH=/home/YOUR_USERNAME/workzone/server/.venv/bin:/usr/bin"
ExecStart=/home/YOUR_USERNAME/workzone/server/.venv/bin/celery -A src.core.celery worker --loglevel=info --concurrency=4
Restart=on-failure
StandardOutput=append:/var/log/workzone/celery.log
StandardError=append:/var/log/workzone/celery.log

[Install]
WantedBy=multi-user.target
```

#### Frontend Service
```bash
sudo nano /etc/systemd/system/workzone-frontend.service
```
```ini
[Unit]
Description=Workzone Frontend
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/workzone/client
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=on-failure
StandardOutput=append:/var/log/workzone/frontend.log
StandardError=append:/var/log/workzone/frontend.log

[Install]
WantedBy=multi-user.target
```

#### Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable workzone-backend workzone-celery workzone-frontend
sudo systemctl start workzone-backend workzone-celery workzone-frontend

# Check status
sudo systemctl status workzone-backend
sudo systemctl status workzone-celery
sudo systemctl status workzone-frontend
```

### 7. Caddy Setup

#### Install Go & Build Caddy
```bash
wget https://go.dev/dl/go1.25.1.linux-amd64.tar.gz
sudo tar -C /usr/local -xvf go1.25.1.linux-amd64.tar.gz
rm go1.25.1.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
~/go/bin/xcaddy build --with github.com/caddy-dns/cloudflare

sudo mv caddy /usr/bin/caddy
sudo chown root:root /usr/bin/caddy
sudo chmod 755 /usr/bin/caddy
```

#### Caddyfile
```bash
sudo mkdir -p /etc/caddy
sudo nano /etc/caddy/Caddyfile
```
```caddyfile
{
    email YOUR_EMAIL@example.com
    admin localhost:2019
    on_demand_tls {
        ask http://127.0.0.1:8000/api/platform/caddy-ask/
    }
}

*.YOUR_DOMAIN.com, YOUR_DOMAIN.com {
    tls {
        dns cloudflare YOUR_CLOUDFLARE_API_TOKEN
    }
    
    handle /api* {
        reverse_proxy 127.0.0.1:8000
    }
    
    handle {
        reverse_proxy localhost:3000
    }
}
```

#### Caddy Service
```bash
sudo nano /etc/systemd/system/caddy.service
```
```ini
[Unit]
Description=Caddy
After=network.target

[Service]
Type=notify
User=root
ExecStart=/usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
TimeoutStopSec=5s
LimitNOFILE=1048576
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

### 8. Firewall
```bash
sudo apt install ufw -y
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Updates

### Backend
```bash
cd ~/workzone
git pull
cd server
uv sync
uv run alembic -c alembic.ini upgrade head
uv run alembic -c alembic_tenant.ini upgrade head
sudo systemctl restart workzone-backend workzone-celery
```

### Frontend
```bash
cd ~/workzone
git pull
cd client
npm install --production
npm run build
sudo systemctl restart workzone-frontend
```

---

## Useful Commands

### Logs
```bash
# Real-time
sudo journalctl -u workzone-backend -f
sudo journalctl -u workzone-celery -f
sudo journalctl -u workzone-frontend -f

# Last 50 lines
sudo journalctl -u workzone-backend -n 50

# View log files
tail -f /var/log/workzone/backend.log
tail -f /var/log/workzone/celery.log
```

### Restart Services
```bash
sudo systemctl restart workzone-backend
sudo systemctl restart workzone-celery
sudo systemctl restart workzone-frontend
sudo systemctl restart caddy
```

### ChromaDB
```bash
# View logs
sudo docker logs chromadb -f

# Restart
sudo docker restart chromadb

# Stop/Start
sudo docker stop chromadb
sudo docker start chromadb
```


---

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
