# 🧩 WorkZone.tech – Frontend (Milestone 3)

### Generative AI-Powered HR Management Platform

_IIT Madras Software Engineering Project – SEP 2025_

This folder contains the **frontend code** for **WorkZone.tech**, developed as part of **Milestone 3: Scheduling & Design**.  
The interface is built with **Next.js 15 **, **Tailwind CSS**, and **ShadCN UI** to deliver a responsive, component-based prototype for the HR Management Platform.

---

## 📦 How to Run the Project (After Downloading ZIP)

> **Note:** This milestone contains only static UI (no backend).  
> Works on Windows, macOS, or Linux.

### 1️⃣ Unzip

Extract the file **`WorkZone-Frontend-M3.zip`** anywhere on your computer.

### 2️⃣ Open Terminal

Right-click inside the extracted **`frontend`** folder → “Open in Terminal”  
or open the folder in **VS Code** and use its terminal.

### 3️⃣ Install Dependencies

#### Using npm

```bash
npm install
```

#### Using pnpm (Recommended)

```bash
pnpm install
```

### 4️⃣ Run Development Server

#### npm

```bash
npm run dev
```

#### pnpm

```bash
pnpm dev
```

### 5️⃣ View in Browser

Visit 👉 **http://localhost:3000**  
You should see the **WorkZone.tech** home page.

---

## 🧩 UI Modules Included

| Module                 | Route                                     | Description                               |
| ---------------------- | ----------------------------------------- | ----------------------------------------- |
| Platform Landing       | `/`                                       | Main landing page with features & pricing |
| Features Page          | `/features`                               | Detailed platform features showcase       |
| Pricing Page           | `/pricing`                                | Subscription plans & pricing details      |
| About Page             | `/about`                                  | Team information & project details        |
| Platform Login         | `/login`                                  | Platform owner authentication             |
| Platform Signup        | `/signup`                                 | Multi-step registration with payment      |
| Platform Dashboard     | `/dashboard`                              | Owner dashboard with team management      |
| AI Resume Scorer       | `/ai-tools/resume-scorer`                 | Upload resumes → AI-powered scoring       |
| AI Interview Assistant | `/ai-tools/interview`                     | Generate questions & analyze responses    |
| Tenant Landing         | `/tenant`                                 | Tenant organization homepage              |
| Tenant Login           | `/tenant/login`                           | Employee/Recruiter authentication         |
| Recruiter Dashboard    | `/tenant/recruiter-portal/dashboard`      | Recruitment metrics & analytics           |
| Jobs Management        | `/tenant/recruiter-portal/jobs`           | Create & manage job postings              |
| Candidates Management  | `/tenant/recruiter-portal/candidates`     | Track & evaluate candidates               |
| Interviews Management  | `/tenant/recruiter-portal/interviews`     | Schedule & manage interviews              |
| Offers Management      | `/tenant/recruiter-portal/offers`         | Create & send job offers                  |
| Resume Scoring Tool    | `/tenant/recruiter-portal/resume-scoring` | Bulk resume analysis for recruiters       |
| Employee Portal        | `/tenant/employee-portal`                 | Company announcements & updates           |
| Employee Profile       | `/tenant/employee-portal/profile`         | Personal & professional information       |
| Team Directory         | `/tenant/employee-portal/team`            | Organization team members                 |
| Company Policies       | `/tenant/employee-portal/policies`        | HR policies & documents                   |
| Support System         | `/tenant/employee-portal/support`         | Submit & track support tickets            |

---

## 🧠 Tech Stack

- **Next.js 15.5.4 (App Router with Turbopack)**
- **React 19.1.0**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Shadcn/ui Components (Radix UI)**
- **React Hook Form + Zod Validation**
- **Framer Motion** (Animations)
- **Recharts** (Analytics & Charts)
- **Lucide Icons**
- **next-themes** (Dark Mode)
- **Razorpay** (Payment Integration)
- **Sonner** (Toast Notifications)
- Mock JSON data for development (API-ready architecture)

---

## 🔢 Folder Structure

```
client/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json
├── .env.local.example
├── public/
│   └── assets/
│       ├── images/
│       └── logos/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── (platform)/              # Platform routes
    │   │   ├── page.tsx             # Landing page
    │   │   ├── login/
    │   │   ├── signup/
    │   │   ├── dashboard/
    │   │   ├── features/
    │   │   ├── pricing/
    │   │   ├── about/
    │   │   └── ai-tools/
    │   │       ├── resume-scorer/
    │   │       └── interview/
    │   ├── tenant/                  # Tenant routes
    │   │   ├── page.tsx
    │   │   ├── login/
    │   │   ├── signup/
    │   │   ├── employee-portal/
    │   │   │   ├── page.tsx         # Announcements
    │   │   │   ├── profile/
    │   │   │   ├── team/
    │   │   │   ├── policies/
    │   │   │   └── support/
    │   │   └── recruiter-portal/
    │   │       ├── dashboard/
    │   │       ├── jobs/
    │   │       ├── candidates/
    │   │       ├── interviews/
    │   │       ├── offers/
    │   │       └── resume-scoring/
    │   └── api/                     # API routes
    ├── components/
    │   ├── ui/                      # Shadcn components
    │   ├── (platform)/              # Platform components
    │   ├── tenant/                  # Tenant components
    │   ├── auth/                    # Auth components
    │   └── ai/                      # AI feature components
    ├── lib/
    │   ├── api.ts
    │   ├── auth.ts
    │   ├── utils.ts
    │   ├── razorpay.ts
    │   └── validations/
    ├── providers/                   # React Context providers
    │   ├── auth-provider.tsx
    │   ├── tenant-provider.tsx
    │   ├── tenant-auth-provider.tsx
    │   └── theme-provider.tsx
    ├── hooks/                       # Custom hooks
    └── data/
        └── tenant/                  # Mock JSON data
```

---

## 🧪 Notes

- **This is a static prototype.** No database or API integration yet.
- Use Chrome or Edge for best rendering.
- Designed for desktop view (1280 px width) and responsive up to tablet.
- Next milestone (M4) will connect to the FastAPI backend and GenAI APIs.

---

## 👥 Team Details

| Member     | Role                                     |
| ---------- | ---------------------------------------- |
| Aayansh    | Backend Developer (FastAPI)              |
| Sandesh    | Frontend Developer (UI Design & Routing) |
| Abhishek   | Frontend Developer (Components & Layout) |
| Mayank     | Team Lead                                |
| Rishabh    | GenAI Integration                        |
| Achal Deep | Code Manager                             |
| Shreyas    | AI/ML Developer                          |
| Raghav Rao | Tester                                   |

---

### ✅ End of README

**Submitted for Milestone 3 – Scheduling & Design**  
_IIT Madras BS in Data Science and Applications – Software Engineering Project (SEP 2025)_
