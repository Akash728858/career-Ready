import { Link } from 'react-router-dom';
import { FileText, Briefcase, Target, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <h1 className="dashboard-page-title">Dashboard</h1>
      <p className="dashboard-page-subtitle">
        Your career hub — resumes, jobs, and interview prep.
      </p>

      <div className="dashboard-cards-grid">
        <Link to="/dashboard/resume" className="dashboard-module-card">
          <div className="dashboard-module-card-header">
            <div className="dashboard-module-icon">
              <FileText strokeWidth={2} />
            </div>
            <h3>Resume Builder</h3>
          </div>
          <p>
            Create and edit ATS-optimized resumes with live preview, templates,
            and PDF export.
          </p>
          <span className="dashboard-module-cta">
            Go to Builder <ChevronRight strokeWidth={2} />
          </span>
        </Link>

        <Link to="/dashboard/job-tracker" className="dashboard-module-card">
          <div className="dashboard-module-card-header">
            <div className="dashboard-module-icon">
              <Briefcase strokeWidth={2} />
            </div>
            <h3>Job Tracker</h3>
          </div>
          <p>
            Track applications, match scores, saved jobs, and daily digest. Set
            preferences for smart matching.
          </p>
          <span className="dashboard-module-cta">
            Browse Jobs <ChevronRight strokeWidth={2} />
          </span>
        </Link>

        <Link to="/dashboard/placement" className="dashboard-module-card">
          <div className="dashboard-module-card-header">
            <div className="dashboard-module-icon">
              <Target strokeWidth={2} />
            </div>
            <h3>Placement Prep</h3>
          </div>
          <p>
            Analyze job descriptions to get readiness scores, skill breakdowns,
            7-day plans, and interview questions.
          </p>
          <span className="dashboard-module-cta">
            Analyze JD <ChevronRight strokeWidth={2} />
          </span>
        </Link>
      </div>

      <div className="dashboard-info-card">
        <h3>Cross-module integration</h3>
        <p>
          Use resumes when applying from Job Tracker. Get prep suggestions based
          on job roles. Add learned skills to your resume.
        </p>
      </div>
    </div>
  );
}
