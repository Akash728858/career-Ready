import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resumeApi } from '../services/api';
import { ArrowLeft, Eye, Trash2 } from 'lucide-react';

const defaultData = {
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [{ school: '', degree: '', dates: '', notes: '' }],
  experience: [{ company: '', role: '', dates: '', description: '' }],
  projects: [{ title: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }],
  skills: { technical: [], soft: [], tools: [] },
  links: { github: '', linkedin: '' },
};

const TEMPLATES = ['classic', 'modern', 'minimal'];
const COLORS = ['teal', 'navy', 'burgundy', 'forest', 'charcoal'];

export default function ResumeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [resume, setResume] = useState(null);
  const [data, setData] = useState(defaultData);
  const [template, setTemplate] = useState('classic');
  const [color, setColor] = useState('teal');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setData(defaultData);
      setLoading(false);
      return;
    }
    resumeApi.get(id)
      .then((r) => {
        setResume(r);
        setData(r.data || defaultData);
        setTemplate(r.template || 'classic');
        setColor(r.color || 'teal');
      })
      .catch(() => navigate('/dashboard/resume'))
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  function update(field, value) {
    setData((prev) => {
      const next = { ...prev };
      const parts = field.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        if (!obj[k] || typeof obj[k] !== 'object') obj[k] = {};
        obj = obj[k];
      }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        const r = await resumeApi.create({ data, template, color });
        navigate(`/dashboard/resume/${r.id}`);
      } else {
        await resumeApi.update(id, { data, template, color });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this resume?')) return;
    try {
      await resumeApi.delete(id);
      navigate('/dashboard/resume');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div>Loading...</div>;

  const p = data.personal || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/resume" className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'New Resume' : (resume?.name || 'Edit Resume')}</h1>
            <p className="text-slate-600">Edit your resume — live preview available.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <Link
                to={`/dashboard/resume/${id}/preview`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
              >
                <Eye className="w-4 h-4" /> Preview
              </Link>
              <button onClick={handleDelete} className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="p-6 rounded-xl bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Personal Info</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={p.name || ''} onChange={(e) => update('personal.name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <input type="email" placeholder="Email" value={p.email || ''} onChange={(e) => update('personal.email', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <input type="text" placeholder="Phone" value={p.phone || ''} onChange={(e) => update('personal.phone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <input type="text" placeholder="Location" value={p.location || ''} onChange={(e) => update('personal.location', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
            </div>
          </section>

          <section className="p-6 rounded-xl bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
            <textarea rows={4} placeholder="Professional summary..." value={data.summary || ''} onChange={(e) => update('summary', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
          </section>

          <section className="p-6 rounded-xl bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Education</h3>
            {(data.education || []).map((edu, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-3">
                <input placeholder="School" value={edu.school || ''} onChange={(e) => {
                  const ed = [...(data.education || [])];
                  ed[i] = { ...ed[i], school: e.target.value };
                  setData((prev) => ({ ...prev, education: ed }));
                }} className="px-3 py-2 rounded-lg border border-slate-200" />
                <input placeholder="Degree" value={edu.degree || ''} onChange={(e) => {
                  const ed = [...(data.education || [])];
                  ed[i] = { ...ed[i], degree: e.target.value };
                  setData((prev) => ({ ...prev, education: ed }));
                }} className="px-3 py-2 rounded-lg border border-slate-200" />
                <input placeholder="Dates" value={edu.dates || ''} onChange={(e) => {
                  const ed = [...(data.education || [])];
                  ed[i] = { ...ed[i], dates: e.target.value };
                  setData((prev) => ({ ...prev, education: ed }));
                }} className="px-3 py-2 rounded-lg border border-slate-200" />
                <input placeholder="Notes" value={edu.notes || ''} onChange={(e) => {
                  const ed = [...(data.education || [])];
                  ed[i] = { ...ed[i], notes: e.target.value };
                  setData((prev) => ({ ...prev, education: ed }));
                }} className="px-3 py-2 rounded-lg border border-slate-200" />
              </div>
            ))}
          </section>

          <section className="p-6 rounded-xl bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Experience</h3>
            {(data.experience || []).map((exp, i) => (
              <div key={i} className="space-y-2 mb-4">
                <input placeholder="Company" value={exp.company || ''} onChange={(e) => {
                  const ex = [...(data.experience || [])];
                  ex[i] = { ...ex[i], company: e.target.value };
                  setData((prev) => ({ ...prev, experience: ex }));
                }} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
                <input placeholder="Role" value={exp.role || ''} onChange={(e) => {
                  const ex = [...(data.experience || [])];
                  ex[i] = { ...ex[i], role: e.target.value };
                  setData((prev) => ({ ...prev, experience: ex }));
                }} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
                <input placeholder="Dates" value={exp.dates || ''} onChange={(e) => {
                  const ex = [...(data.experience || [])];
                  ex[i] = { ...ex[i], dates: e.target.value };
                  setData((prev) => ({ ...prev, experience: ex }));
                }} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
                <textarea placeholder="Description" rows={2} value={exp.description || ''} onChange={(e) => {
                  const ex = [...(data.experience || [])];
                  ex[i] = { ...ex[i], description: e.target.value };
                  setData((prev) => ({ ...prev, experience: ex }));
                }} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              </div>
            ))}
          </section>

          <section className="p-6 rounded-xl bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Skills (comma-separated)</h3>
            <input placeholder="Technical: React, Node.js, Python" value={(data.skills?.technical || []).join(', ')} onChange={(e) => update('skills.technical', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
            <input placeholder="Soft: Communication, Leadership" value={(data.skills?.soft || []).join(', ')} onChange={(e) => update('skills.soft', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full px-3 py-2 rounded-lg border border-slate-200 mt-2" />
            <input placeholder="Tools: Git, Docker" value={(data.skills?.tools || []).join(', ')} onChange={(e) => update('skills.tools', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full px-3 py-2 rounded-lg border border-slate-200 mt-2" />
          </section>

          <section className="p-6 rounded-xl bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Links</h3>
            <input type="url" placeholder="GitHub" value={data.links?.github || ''} onChange={(e) => update('links.github', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 mb-2" />
            <input type="url" placeholder="LinkedIn" value={data.links?.linkedin || ''} onChange={(e) => update('links.linkedin', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
          </section>

          <section className="p-6 rounded-xl bg-white border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Template & Color</h3>
            <div className="flex gap-2 mb-3">
              {TEMPLATES.map((t) => (
                <button key={t} onClick={() => setTemplate(t)} className={`px-3 py-2 rounded-lg text-sm font-medium ${template === t ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>{t}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`px-3 py-2 rounded-lg text-sm font-medium capitalize ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`} style={{ backgroundColor: `var(--${c})` || '#0d9488' }}>{c}</button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Live Preview</h3>
            <div className="text-sm text-slate-700 space-y-2">
              <p className="text-lg font-semibold">{p.name || 'Your Name'}</p>
              <p className="text-slate-500">{[p.email, p.phone, p.location].filter(Boolean).join(' · ')}</p>
              {data.summary && <p className="mt-2">{data.summary}</p>}
              {(data.education || []).filter(e => e.school || e.degree).map((e, i) => (
                <p key={i}><strong>{e.school}</strong> — {e.degree} ({e.dates})</p>
              ))}
              {(data.experience || []).filter(e => e.company || e.role).map((e, i) => (
                <p key={i}><strong>{e.company}</strong> — {e.role} ({e.dates})</p>
              ))}
              {((data.skills?.technical || []).concat(data.skills?.soft || []).concat(data.skills?.tools || [])).length > 0 && (
                <p>Skills: {[...(data.skills?.technical || []), ...(data.skills?.soft || []), ...(data.skills?.tools || [])].join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
