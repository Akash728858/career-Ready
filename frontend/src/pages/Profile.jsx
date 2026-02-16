import { useState, useRef, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { User, Linkedin, Github, Globe, X, Plus, Trash2 } from 'lucide-react';

const defaultProject = () => ({
  id: typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: '',
  startDate: '',
  endDate: '',
  summary: '',
});

export default function Profile() {
  const { profile, updateProfile, setPhotoUrl } = useProfile();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    summary: '',
    skills: [],
    linkedIn: '',
    github: '',
    portfolio: '',
    projects: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      summary: profile?.summary || '',
      skills: profile?.skills || [],
      linkedIn: profile?.linkedIn || '',
      github: profile?.github || '',
      portfolio: profile?.portfolio || '',
      projects: profile?.projects?.length ? profile.projects : [],
    });
  }, [profile?.name, profile?.phone, profile?.summary, profile?.skills, profile?.linkedIn, profile?.github, profile?.portfolio, profile?.projects]);

  const scrollToEditable = () => {
    setIsEditing(true);
    setTimeout(() => editableRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleCancel = () => {
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      summary: profile?.summary || '',
      skills: profile?.skills || [],
      linkedIn: profile?.linkedIn || '',
      github: profile?.github || '',
      portfolio: profile?.portfolio || '',
      projects: profile?.projects?.length ? [...profile.projects] : [],
    });
    setSkillInput('');
    setIsEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (s) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }));
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [...prev.projects, defaultProject()],
    }));
  };

  const updateProject = (id, updates) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deleteProject = (id) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const displayName = profile?.name || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">Profile</h1>
      <p className="profile-page-subtitle">Manage your professional information.</p>

      <div className="profile-two-col">
        {/* LEFT: Profile Summary Card (30%) */}
        <div className="profile-summary-card">
          {profile?.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt=""
              className="profile-summary-avatar"
            />
          ) : (
            <div className="profile-summary-avatar-placeholder">
              <User size={48} strokeWidth={2} />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          {isEditing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="profile-edit-btn"
              style={{ marginBottom: 12, background: '#f1f5f9', color: '#475569' }}
            >
              Change Photo
            </button>
          )}
          <p className="profile-summary-name">{displayName}</p>
          <p className="profile-summary-email">{profile?.email}</p>
          {profile?.phone && <p className="profile-summary-phone">{profile.phone}</p>}
          {(profile?.linkedIn || profile?.github || profile?.portfolio) && (
            <div className="profile-summary-social">
              {profile?.linkedIn && (
                <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin size={20} strokeWidth={2} />
                </a>
              )}
              {profile?.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github size={20} strokeWidth={2} />
                </a>
              )}
              {profile?.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" aria-label="Portfolio">
                  <Globe size={20} strokeWidth={2} />
                </a>
              )}
            </div>
          )}
          <button
            type="button"
            className="profile-edit-btn"
            onClick={isEditing ? handleCancel : scrollToEditable}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* RIGHT: Editable Details (70%) */}
        <div className="profile-details" ref={editableRef}>
          {/* Section 1: Basic Information */}
          <section className="profile-section">
            <h2 className="profile-section-title">Basic Information</h2>
            <div className="profile-field">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                disabled={!isEditing}
                readOnly={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={profile?.email || ''}
                disabled
                placeholder="Registered email"
              />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
                disabled={!isEditing}
                readOnly={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-summary">Professional Summary</label>
              <textarea
                id="profile-summary"
                value={form.summary}
                onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Brief overview of your experience and goals..."
                rows={4}
                disabled={!isEditing}
                readOnly={!isEditing}
              />
            </div>
          </section>

          {/* Section 2: Skills */}
          <section className="profile-section">
            <h2 className="profile-section-title">Skills</h2>
            {isEditing && (
              <div className="profile-skills-row">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill"
                />
                <button type="button" className="profile-add-skill-btn" onClick={addSkill}>
                  Add Skill
                </button>
              </div>
            )}
            <div className="profile-skill-tags">
              {form.skills.map((s) => (
                <span key={s} className="profile-skill-tag">
                  {s}
                  {isEditing && (
                    <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                      <X size={14} strokeWidth={2} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </section>

          {/* Section 3: Social Links */}
          <section className="profile-section">
            <h2 className="profile-section-title">Social Links</h2>
            <div className="profile-field">
              <label htmlFor="profile-linkedin">LinkedIn Profile URL</label>
              <input
                id="profile-linkedin"
                type="url"
                value={form.linkedIn}
                onChange={(e) => setForm((p) => ({ ...p, linkedIn: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
                disabled={!isEditing}
                readOnly={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-github">GitHub Profile URL</label>
              <input
                id="profile-github"
                type="url"
                value={form.github}
                onChange={(e) => setForm((p) => ({ ...p, github: e.target.value }))}
                placeholder="https://github.com/yourusername"
                disabled={!isEditing}
                readOnly={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-portfolio">Portfolio Website URL</label>
              <input
                id="profile-portfolio"
                type="url"
                value={form.portfolio}
                onChange={(e) => setForm((p) => ({ ...p, portfolio: e.target.value }))}
                placeholder="https://yourportfolio.com"
                disabled={!isEditing}
                readOnly={!isEditing}
              />
            </div>
          </section>

          {/* Section 4: Projects */}
          <section className="profile-section">
            <h2 className="profile-section-title">Projects</h2>
            {form.projects.map((proj) => (
              <div key={proj.id} className="profile-project-card">
                <div className="profile-project-header">
                  {isEditing ? (
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                      placeholder="Project Name"
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 15,
                        fontWeight: 600,
                        flex: 1,
                      }}
                    />
                  ) : (
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                      {proj.name || 'Untitled Project'}
                    </h4>
                  )}
                  {isEditing && (
                    <div className="profile-project-actions">
                      <button
                        type="button"
                        className="delete"
                        onClick={() => deleteProject(proj.id)}
                        aria-label="Delete project"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="profile-input-row" style={{ marginBottom: 12 }}>
                  <div className="profile-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={proj.startDate}
                      onChange={(e) => updateProject(proj.id, { startDate: e.target.value })}
                      disabled={!isEditing}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="profile-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={proj.endDate}
                      onChange={(e) => updateProject(proj.id, { endDate: e.target.value })}
                      disabled={!isEditing}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
                <div className="profile-field">
                  <label>Project Summary</label>
                  {isEditing ? (
                    <textarea
                      value={proj.summary}
                      onChange={(e) => updateProject(proj.id, { summary: e.target.value })}
                      placeholder="Brief description of the project..."
                      rows={3}
                    />
                  ) : (
                    <p style={{ margin: 0, fontSize: 15, color: '#334155', lineHeight: 1.5, padding: '10px 0' }}>
                      {proj.summary || '—'}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isEditing && (
              <button type="button" className="profile-add-project-btn" onClick={addProject}>
                <Plus size={18} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                Add Project
              </button>
            )}
          </section>

          {/* Save bar */}
          {isEditing && (
            <div className="profile-save-bar">
              <button type="button" className="profile-save-btn" onClick={handleSave}>
                {saved ? 'Saved!' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
