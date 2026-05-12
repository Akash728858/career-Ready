import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobTrackerApi } from '../services/api';

export default function JobSettings() {
  const [prefs, setPrefs] = useState({
    roleKeywords: '',
    preferredLocations: [],
    preferredMode: [],
    experienceLevel: '',
    skills: '',
    minMatchScore: 40,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    jobTrackerApi.getPreferences()
      .then(({ preferences: p }) => {
        if (p && Object.keys(p).length) setPrefs((prev) => ({ ...prev, ...p }));
      })
      .catch(() => {});
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await jobTrackerApi.savePreferences(prefs);
      setSaved(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Noida', 'Remote'];

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Preferences</h1>
        <p className="text-slate-600">Configure how we match jobs to you.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role keywords (comma-separated)</label>
          <input
            type="text"
            value={prefs.roleKeywords}
            onChange={(e) => setPrefs((p) => ({ ...p, roleKeywords: e.target.value }))}
            placeholder="e.g. Frontend, React, SDE"
            className="w-full px-3 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Preferred locations</label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => (
              <label key={loc} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={prefs.preferredLocations?.includes(loc)}
                  onChange={(e) => {
                    const arr = prefs.preferredLocations || [];
                    if (e.target.checked) setPrefs((p) => ({ ...p, preferredLocations: [...arr, loc] }));
                    else setPrefs((p) => ({ ...p, preferredLocations: arr.filter((l) => l !== loc) }));
                  }}
                />
                <span>{loc}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Preferred mode</label>
          <div className="flex gap-4">
            {['Remote', 'Hybrid', 'Onsite'].map((mode) => (
              <label key={mode} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={prefs.preferredMode?.includes(mode)}
                  onChange={(e) => {
                    const arr = prefs.preferredMode || [];
                    if (e.target.checked) setPrefs((p) => ({ ...p, preferredMode: [...arr, mode] }));
                    else setPrefs((p) => ({ ...p, preferredMode: arr.filter((m) => m !== mode) }));
                  }}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Experience level</label>
          <select
            value={prefs.experienceLevel}
            onChange={(e) => setPrefs((p) => ({ ...p, experienceLevel: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200"
          >
            <option value="">Select</option>
            <option value="Fresher">Fresher</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma-separated)</label>
          <input
            type="text"
            value={prefs.skills}
            onChange={(e) => setPrefs((p) => ({ ...p, skills: e.target.value }))}
            placeholder="e.g. React, Python, Java"
            className="w-full px-3 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Minimum match score: {prefs.minMatchScore}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={prefs.minMatchScore}
            onChange={(e) => setPrefs((p) => ({ ...p, minMatchScore: parseInt(e.target.value, 10) }))}
            className="w-full"
          />
        </div>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        {saved && <span className="ml-2 text-green-600 text-sm">Saved!</span>}
      </form>

      <Link to="/dashboard/jobs" className="inline-block text-primary font-medium">← Back to Jobs</Link>
    </div>
  );
}
