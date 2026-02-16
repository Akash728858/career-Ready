# Career Platform

A unified career management application that integrates **Resume Builder**, **Job Application Tracker**, and **Placement & Interview Preparation** into a single platform with shared authentication and database.

## Overview

Career Platform consolidates three separate applications into one cohesive experience:

1. **Resume Builder** — Create, edit, preview, and export ATS-optimized resumes with multiple templates and color themes
2. **Job Tracker** — Browse jobs, track application status, save favorites, set preferences for match scoring, and generate daily digests
3. **Placement Prep** — Analyze job descriptions to get readiness scores, skill breakdowns, 7-day preparation plans, and interview questions

## Features

### Resume Module
- Personal info, summary, education, experience, projects, skills (technical, soft, tools), links
- Templates: Classic, Modern, Minimal
- Color themes: Teal, Navy, Burgundy, Forest, Charcoal
- Live preview and PDF export
- Multiple resumes per user
- ATS scoring logic (from original Resume Builder)

### Job Tracker Module
- 60 Indian tech jobs (seed data)
- Filters: keyword, location, mode, experience, source, status, sort
- Match scoring based on user preferences
- Saved jobs
- Status tracking: Not Applied, Applied, Rejected, Selected
- Daily digest (top 10 matched jobs)
- Preferences: role keywords, locations, mode, experience, skills, min match score

### Placement Prep Module
- JD analysis: paste job description
- Readiness score (0–100)
- Extracted skills by category (Core CS, Languages, Web, Data, Cloud/DevOps, Testing)
- Preparation checklist by round
- 7-day preparation plan
- Interview questions
- Company intel and round mapping
- History of past analyses

### Cross-Module Integration
- **Resume ↔ Job Tracker**: Select resume when applying (planned enhancement)
- **Job Tracker ↔ Placement Prep**: Prep suggestions based on job role (architecture in place)
- **Placement Prep ↔ Resume**: Add learned skills to resume (planned enhancement)

## Architecture

**Modular monolith** with clear separation:

```
career-platform/
├── backend/           # Node.js + Express
│   ├── auth/          # Registration, login, JWT
│   ├── resume/        # Resume CRUD
│   ├── job_tracker/   # Jobs, saved, preferences, digest
│   ├── placement_prep/# JD analysis, preparations
│   ├── common/        # Auth middleware, constants
│   ├── config/        # Database config
│   └── database/      # Schema init
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/     # Dashboard, Resume, Jobs, Prep
│   │   ├── context/   # Auth context
│   │   └── services/  # API layer
```

- **Backend**: Express, SQLite (better-sqlite3), JWT auth, bcrypt
- **Frontend**: React 19, Vite, React Router, Tailwind CSS
- **Database**: SQLite (single file, easy to migrate to PostgreSQL)

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd career-platform

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

### Environment

Copy `.env.example` to `.env` and set:

```
PORT=5000
JWT_SECRET=your-secret-key
DATABASE_PATH=./career_platform.db
```

### Run Locally

**Option 1: Run backend and frontend together**
```bash
npm run dev
```
This starts the backend on port 5000 and frontend on port 3000.

**Option 2: Run separately**
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend (with proxy to backend)
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000/api

### Build for Production

```bash
npm run build
npm start
```

The backend serves the built frontend from `frontend/dist`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/resumes | List resumes |
| POST | /api/resumes | Create resume |
| GET | /api/resumes/:id | Get resume |
| PUT | /api/resumes/:id | Update resume |
| DELETE | /api/resumes/:id | Delete resume |
| GET | /api/job-tracker/jobs | Get jobs (with filters) |
| GET | /api/job-tracker/saved | Get saved jobs |
| GET | /api/job-tracker/preferences | Get preferences |
| POST | /api/job-tracker/preferences | Save preferences |
| POST | /api/job-tracker/saved/:jobId | Toggle save job |
| PUT | /api/job-tracker/status/:jobId | Set job status |
| POST | /api/job-tracker/digest/generate | Generate digest |
| GET | /api/job-tracker/digest | Get today's digest |
| POST | /api/placement-prep/analyze | Analyze JD |
| GET | /api/placement-prep/preparations | List preparations |
| GET | /api/placement-prep/preparations/:id | Get preparation |

All routes except auth require `Authorization: Bearer <token>`.

## Database Schema

- **users**: id, email, password_hash, name
- **resumes**: id, user_id, name, data (JSON), template, color
- **job_applications**: (for user-added jobs)
- **saved_jobs**: user_id, job_id
- **job_status**: user_id, job_id, status
- **job_preferences**: user_id, preferences (JSON)
- **preparation_data**: id, user_id, company, role, jd_text, extracted_skills, checklist, plan, questions, readiness_score, etc.
- **digest_cache**: user_id, digest_date, jobs (JSON)

## Future Enhancements

- Resume selection when applying from Job Tracker
- Add skills from Placement Prep to Resume
- Topic-wise DSA practice and progress tracking
- Quizzes and assessments
- Email digest delivery
- PostgreSQL migration for production

## License

MIT
