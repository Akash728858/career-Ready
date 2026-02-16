import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobTrackerApi } from '../services/api';
import { ExternalLink, RefreshCw } from 'lucide-react';

export default function JobDigest() {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    jobTrackerApi.getDigest().then(setDigest).catch(() => setDigest(null));
  }, []);

  async function generate() {
    setLoading(true);
    try {
      const d = await jobTrackerApi.generateDigest();
      setDigest(d);
    } catch (e) {
      alert(e.message || 'Set preferences first in Settings.');
    } finally {
      setLoading(false);
    }
  }

  const jobs = digest?.jobs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Digest</h1>
          <p className="text-slate-600">Top 10 jobs for you — 9AM digest</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Generate Today's Digest
        </button>
      </div>

      {!digest || jobs.length === 0 ? (
        <div className="p-12 rounded-xl bg-white border border-slate-200 text-center">
          <p className="text-slate-600">Set preferences in Settings, then generate your digest to see top 10 matched jobs.</p>
          <Link to="/dashboard/jobs/settings" className="inline-block mt-4 text-primary font-medium">Go to Settings</Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Generated for {digest.date}</p>
          {jobs.map((job) => (
            <div key={job.id} className="p-6 rounded-xl bg-white border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{job.title}</h3>
                  <p className="text-slate-600">{job.company} · {job.location}</p>
                  <p className="text-sm text-slate-500">Match: {job.matchScore ?? 0}</p>
                </div>
                {job.applyUrl && (
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-white bg-primary hover:opacity-90 text-sm">
                    Apply <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
