import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function ResumePreview() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeApi.get(id)
      .then(setResume)
      .catch(() => setResume(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!resume) return <div>Resume not found</div>;

  const data = resume.data || {};
  const p = data.personal || {};
  const skills = [...(data.skills?.technical || []), ...(data.skills?.soft || []), ...(data.skills?.tools || [])];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to={`/dashboard/resume/${id}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" /> Back to edit
        </Link>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90">
          Download PDF (Print)
        </button>
      </div>
      <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm print:shadow-none">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{p.name || 'Your Name'}</h1>
        <p className="text-slate-500 mb-4">{[p.email, p.phone, p.location].filter(Boolean).join(' · ')}</p>
        {data.summary && <section className="mb-4"><h2 className="text-sm font-semibold uppercase text-slate-700 mb-1">Summary</h2><p>{data.summary}</p></section>}
        {(data.education || []).filter(e => e.school || e.degree).length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-semibold uppercase text-slate-700 mb-2">Education</h2>
            {(data.education || []).map((e, i) => (
              <p key={i}><strong>{e.school}</strong> — {e.degree} · {e.dates}{e.notes && ` — ${e.notes}`}</p>
            ))}
          </section>
        )}
        {(data.experience || []).filter(e => e.company || e.role).length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-semibold uppercase text-slate-700 mb-2">Experience</h2>
            {(data.experience || []).map((e, i) => (
              <div key={i} className="mb-2">
                <p><strong>{e.company}</strong> — {e.role} · {e.dates}</p>
                {e.description && <p className="text-slate-600 text-sm">{e.description}</p>}
              </div>
            ))}
          </section>
        )}
        {(data.projects || []).filter(pr => pr.title).length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-semibold uppercase text-slate-700 mb-2">Projects</h2>
            {(data.projects || []).map((pr, i) => (
              <div key={i} className="mb-2">
                <p><strong>{pr.title}</strong>{pr.githubUrl && ` — ${pr.githubUrl}`}</p>
                {pr.description && <p className="text-slate-600 text-sm">{pr.description}</p>}
              </div>
            ))}
          </section>
        )}
        {skills.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase text-slate-700 mb-2">Skills</h2>
            <p>{skills.join(', ')}</p>
          </section>
        )}
      </div>
    </div>
  );
}
