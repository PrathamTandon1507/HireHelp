# HireHelp - AI-Assisted Recruitment Platform

---

## 📋 Project Overview

HireHelp is an **AI-powered recruitment platform** that revolutionizes the hiring process through intelligent candidate matching, automated resume analysis, and blockchain-verified audit trails. The platform serves three distinct user roles—Applicants, Recruiters, and Administrators—providing each with tailored tools to streamline recruitment workflows.

Built with modern technologies including **React**, **Node.js**, **MongoDB**, **Python ML services**, and **Solidity smart contracts**, HireHelp combines enterprise-grade functionality with an intuitive, visually sophisticated interface.

---

## 🎯 Problem Statement

Traditional recruitment processes face critical challenges:

- **Time-Consuming Manual Screening:** Recruiters spend 60-70% of their time manually reviewing resumes
- **Unconscious Bias:** Human-driven screening introduces subjective biases that affect diversity
- **Lack of Transparency:** Applicants receive minimal feedback and unclear status updates
- **No Audit Trail:** Hiring decisions lack verifiable documentation for compliance
- **Inefficient Matching:** Poor alignment between candidate skills and job requirements leads to high turnover

**HireHelp solves these problems** by automating candidate evaluation, providing transparent AI-driven insights, and creating immutable audit records for every hiring decision.

---

## Software Design

The HireHelp system follows a layered client–server architecture that separates the user interface, application logic, core services, and data storage to ensure scalability and maintainability. Key system functionalities such as AI-assisted resume matching, workflow validation, analytics, and audit verification are implemented as independent, highly cohesive services that communicate through well-defined APIs, enabling low coupling and ease of future extension.

The design emphasizes abstraction and modularity by isolating complex components like AI processing and audit mechanisms from core business logic. A controlled workflow engine enforces valid hiring stage transitions, while a minimal blockchain-based audit mechanism stores cryptographic hashes of finalized decisions to ensure integrity without exposing sensitive data.

<img width="875" height="826" alt="image" src="https://github.com/user-attachments/assets/882c7e52-a096-4a6d-8eae-859dd4c77586" />




## 👥 Target Users (Personas)

### Persona 1: Sarah - Tech Recruiter
**Demographics:**
- Age: 28-35
- Role: Technical Recruiter at mid-size tech company
- Experience: 3-5 years in recruitment

**Goals:**
- Quickly identify top candidates from 100+ applications
- Reduce time-to-hire from 45 days to 25 days
- Make data-driven hiring decisions

**Pain Points:**
- Spends 15+ hours/week manually screening resumes
- Struggles to objectively compare candidates
- Lacks tools to generate relevant interview questions

**How HireHelp Helps:**
- AI ranking reduces screening time by 70%
- Skill gap analysis provides objective comparison
- Auto-generated interview questions tailored to each candidate

---

### Persona 2: Mike - Software Engineer (Applicant)
**Demographics:**
- Age: 25-40
- Role: Mid-level software engineer seeking new opportunities
- Experience: 3-8 years in software development

**Goals:**
- Find roles that match his skillset
- Receive timely feedback on applications
- Understand why he was/wasn't selected

**Pain Points:**
- Applications submitted into "black holes" with no response
- No visibility into application status
- Generic job descriptions don't match actual requirements

**How HireHelp Helps:**
- Real-time application tracking with stage visibility
- AI-powered job recommendations based on resume
- Transparent feedback at each hiring stage

---

### Persona 3: Lisa - HR Director (Admin)
**Demographics:**
- Age: 35-50
- Role: HR Director overseeing recruitment strategy
- Experience: 10+ years in human resources

**Goals:**
- Ensure compliance and fairness in hiring
- Monitor recruitment metrics across departments
- Maintain auditable records for legal requirements

**Pain Points:**
- No centralized view of hiring pipeline
- Difficulty proving hiring decisions were unbiased
- Manual reporting is time-intensive

**How HireHelp Helps:**
- System-wide dashboard with real-time metrics
- Blockchain audit trail provides immutable proof
- Automated compliance reporting

---

## 🚀 Vision Statement

**To transform recruitment from a manual, subjective process into an intelligent, transparent, and accountable system that empowers both employers and job seekers to make better decisions faster.**

We envision a future where:
- Every candidate receives fair, AI-assisted evaluation regardless of background
- Recruiters focus on human connection rather than administrative tasks
- Hiring decisions are explainable, auditable, and compliant
- Technology amplifies human judgment rather than replacing it

---

## ✨ Key Features / Goals

### Core Features (MVP)

#### 🔐 Authentication & Role Management
- Multi-role system (Admin, Recruiter, Applicant)
- Secure JWT-based authentication
- Role-based access control (RBAC)

#### 💼 Job Management
- Create, update, and manage job postings
- Rich job descriptions with requirements and responsibilities
- Status tracking (Active, Closed, Draft)
- Search and filter functionality

#### 📄 Resume Processing & Profile Management
- PDF resume upload with drag-and-drop
- AI-powered resume parsing (Python ML service)
- Automatic skill extraction
- Candidate profile management

#### 🤖 AI-Powered Candidate Matching
- Semantic similarity analysis between resume and job description
- Automated candidate ranking with match scores
- Skill gap identification and analysis
- AI-generated interview questions tailored to each candidate

#### 📊 Hiring Workflow Management
- Multi-stage hiring pipeline (Applied → Screening → Interview → Offer → Hired)
- Sequential stage progression with validation
- Feedback capture at each stage
- Audit trail for all decisions

#### 🔗 Blockchain Audit Trail
- Immutable offer records on blockchain
- Cryptographic hash generation for verification
- Tamper-proof compliance documentation

#### 📈 Analytics & Dashboards
- Role-specific dashboards with real-time metrics
- Application tracking for candidates
- Recruitment pipeline visibility for recruiters
- System-wide oversight for administrators

---

## 📊 Success Metrics

### Quantitative Metrics
- **70% reduction** in resume screening time
- **40% decrease** in average time-to-hire
- **90%+ candidate satisfaction** with application transparency
- **100% audit compliance** for hiring decisions
- **50% improvement** in candidate-job match quality

### Qualitative Metrics
- Recruiters report increased confidence in hiring decisions
- Candidates report clearer understanding of application status
- HR teams demonstrate audit readiness within minutes
- Reduced bias complaints due to AI-assisted evaluation

---

## 🔧 Assumptions & Constraints

### Assumptions
- **User Base:** Users have modern web browsers (Chrome, Firefox, Edge, Safari)
- **Technical Literacy:** Recruiters comfortable with standard SaaS applications
- **Resume Format:** Candidates primarily submit PDF resumes
- **Internet Access:** Reliable connection for real-time features
- **Data Privacy:** Users consent to AI processing of resumes
- **Email Access:** Users have valid email addresses for notifications

### Constraints
- **Budget:** Academic project using free-tier services only
- **Timeline:** 8-week development window
- **Team Size:** Solo developer (all components)
- **Technology Stack:** Limited to JavaScript/TypeScript, Python, Solidity
- **Scalability:** Initial deployment targets 100-500 concurrent users
- **Blockchain:** Testnet only (no mainnet deployment costs)

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Routing:** React Router v6
- **HTTP Client:** Fetch API
- **Form Handling:** Custom validation

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Validation:** Express Validator
- **API Design:** RESTful architecture

### Database
- **Primary DB:** MongoDB (NoSQL)
- **ODM:** Mongoose
- **Caching:** Redis (planned)

### AI/ML Services
- **Language:** Python 3.10+
- **Framework:** Flask
- **NLP:** Sentence Transformers (all-MiniLM-L6-v2)
- **PDF Parsing:** PyPDF2 / pdfplumber
- **Vector Search:** FAISS / Pinecone
- **LLM Integration:** OpenAI API / Local models

### Blockchain
- **Smart Contracts:** Solidity
- **Framework:** Hardhat
- **Network:** Ethereum Sepolia Testnet
- **Interaction:** Ethers.js

### DevOps
- **Containerization:** Docker + Docker Compose
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions (planned)
- **Deployment:** AWS / Vercel / Railway (TBD)

---

## 🌿 Branching Strategy

We follow **GitHub Flow** for its simplicity and continuous deployment capabilities.

### Branch Structure

```
main (production-ready)
  ├── feature/job-cards-and-scoring
  ├── feature/backend-api-skeleton
  ├── feature/ai-ml-pipeline-design
  └── feature/audit-blockchain-placeholder
```

### Workflow Process

1. **Create Feature Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Develop & Commit**
   ```bash
   git add .
   git commit -m "feat: descriptive commit message"
   ```

3. **Push Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open Pull Request**
   - Go to GitHub repository
   - Click "Pull requests" → "New pull request"
   - Select your feature branch
   - Add description and request review

5. **Merge to Main**
   - After review/approval
   - Merge via GitHub UI
   - Delete feature branch

6. **Pull Latest Main**
   ```bash
   git checkout main
   git pull origin main
   ```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Features | `feature/short-description` | `feature/ai-matching` |
| Bug Fixes | `fix/bug-description` | `fix/login-redirect` |
| Documentation | `docs/update-description` | `docs/api-documentation` |
| Refactoring | `refactor/component-name` | `refactor/auth-context` |

### Active Feature Branches

-  `feature/job-cards-and-scoring` - Job display and AI scoring UI
-  `feature/backend-api-skeleton` - Express API structure and routes
-  `feature/ai-ml-pipeline-design` - Python ML service architecture
-  `feature/audit-blockchain-placeholder` - Smart contract integration

---

## 🚀 Quick Start – Local Development

### Prerequisites

Ensure you have these installed:
-  **Docker Desktop** (recommended) - [Download](https://www.docker.com/products/docker-desktop/)
-  **Node.js 18+** - [Download](https://nodejs.org/)
-  **Git** - [Download](https://git-scm.com/)
-  **MongoDB Compass** (optional, for DB GUI) - [Download](https://www.mongodb.com/products/compass)

---

### Running with Docker

**Step 1: Clone Repository**
```bash
git clone https://github.com/PratTandon/hirehelp.git
cd hirehelp
```

**Step 2: Build and Start All Services**
```bash
docker-compose up --build
```

**Step 3: Stop Services**
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

**Useful Docker Commands:**
```bash
# View running containers
docker ps

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build frontend

# Execute command in container
docker-compose exec backend npm install new-package
```

## 🛠️ Development Tools

### Code & IDE
- **Editor:** Visual Studio Code
- **Extensions:** 
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Docker
  - MongoDB for VS Code

### API Development & Testing
- **API Client:** Postman / Thunder Client (VS Code extension)
- **API Documentation:** Swagger (planned)

### Database Management
- **GUI Tool:** MongoDB Compass
- **CLI:** MongoDB Shell (mongosh)

### Design & Planning
- **Wireframes:** Figma (free tier)
- **Architecture Diagrams:** Draw.io
- **Project Management:** GitHub Projects

### Version Control
- **CLI:** Git Bash
- **GUI:** GitHub Desktop (optional)
- **Hosting:** GitHub

### Container Management
- **Platform:** Docker Desktop
- **Orchestration:** Docker Compose

### AI/ML Development
- **Package Manager:** pip
- **Environment:** Python venv
- **Notebook:** Jupyter (optional)

### Blockchain Development
- **Framework:** Hardhat
- **Network:** Ethereum Sepolia Testnet
- **Wallet:** MetaMask

---

## 🎨 Key Features & Functionality

### 1. Intelligent Authentication System
- Multi-role registration (Applicant, Recruiter, Admin)
- Secure JWT-based authentication
- Role-based dashboard routing
- Session persistence with localStorage

### 2. Job Management
- **Recruiters/Admins:**
  - Create detailed job postings
  - Manage active/draft/closed positions
  - View applicant counts in real-time
- **Applicants:**
  - Browse and search job listings
  - Filter by type, location, department
  - Apply with one click

### 3. Resume Processing Pipeline
- Drag-and-drop PDF upload
- Python-based text extraction
- AI-powered skill identification
- Profile auto-population from resume data

### 4. AI Candidate Shortlisting
- **Semantic Matching:** Uses sentence transformers to compare resume content with job descriptions
- **Ranked Results:** Candidates sorted by match score (0-100%)
- **Explainable AI:** Shows why candidates scored high/low
- **Skill Gap Analysis:** Identifies missing qualifications
- **Interview Questions:** Auto-generated based on candidate background

### 5. Hiring Workflow Engine
- **Stage Progression:** Applied → Screening → Interview → Offer → Hired
- **Feedback System:** Capture notes at each stage
- **Audit Logging:** All state changes tracked
- **Offer Management:** Structured offer creation with terms

### 6. Blockchain Audit Trail
- Offer details hashed and stored on Ethereum
- Immutable proof of hiring decisions
- Compliance-ready verification system
- Gas-efficient smart contract design

### 7. Notification System
- Real-time toast notifications
- Success/Error/Warning/Info types
- Auto-dismiss with progress bar
- Non-intrusive positioning

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to Shortlist** | 70% reduction | Before: 4 hours → After: 1.2 hours |
| **Candidate Satisfaction** | 4.5/5 average | Post-application survey |
| **Time to Hire** | 40% improvement | Before: 45 days → After: 27 days |
| **Audit Compliance** | 100% | All offers blockchain-verified |
| **Match Accuracy** | 85%+ | Hired candidates meet >85% of job requirements |
| **User Adoption** | 80% active usage | Weekly active users / total registered |
| **Resume Processing** | <10 seconds | Time from upload to skill extraction |

---

## 🤝 Contributing

This is an academic project, but contributions and feedback are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is developed for academic purposes. Created by Pratham Tandon.

---

## 🙏 Acknowledgments

- Design inspiration from modern SaaS platforms
- AI/ML powered by Sentence Transformers
- UI theme based on "Intelligent Maximalism" design philosophy
- Blockchain integration for audit transparency

---
