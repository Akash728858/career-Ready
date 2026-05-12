import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../services/api';
import { Plus, FileText, ChevronRight } from 'lucide-react';

const defaultData = {
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: { technical: [], soft: [], tools: [] },
  links: { github: '', linkedin: '' },
};

export default function ResumeBuilder() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeApi.list()
      .then(({ resumes: r }) => setResumes(r))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const r = await resumeApi.create({ data: defaultData });
      window.location.href = `/dashboard/resume/${r.id}`;
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Resume Builder</h1>
          <p className="dashboard-page-subtitle">Create and manage ATS-optimized resumes.</p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="dashboard-btn dashboard-btn-primary"
        >
          <Plus size={20} strokeWidth={2} /> New Resume
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading...</p>
      ) : resumes.length === 0 ? (
        <div className="dashboard-empty">
          <FileText size={64} strokeWidth={1.5} />
          <h3>No resumes yet</h3>
          <p>Create your first resume to get started.</p>
          <button
            type="button"
            onClick={handleCreate}
            className="dashboard-btn dashboard-btn-primary"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <div className="dashboard-list">
          {resumes.map((r) => (
            <Link
              key={r.id}
              to={`/dashboard/resume/${r.id}`}
              className="dashboard-list-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="dashboard-module-icon" style={{ width: 40, height: 40 }}>
                  <FileText size={20} strokeWidth={2} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, color: '#0f172a' }}>
                    {r.name || 'Untitled Resume'}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#64748b' }}>
                    {new Date(r.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} color="#94a3b8" strokeWidth={2} />
            </Link>
          ))}
        </div>
      )}

      <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
        Full resume builder with personal info, education, experience, projects, skills, templates
        (Classic, Modern, Minimal), color themes, ATS scoring, and PDF export — available in the
        dedicated editor when you create or open a resume.
      </p>
    </div>
  );
}
