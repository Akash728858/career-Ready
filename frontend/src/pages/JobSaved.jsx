import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobTrackerApi } from '../services/api';
import { Bookmark, ExternalLink } from 'lucide-react';

export default function JobSaved() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobTrackerApi.getSaved()
      .then(({ jobs: j }) => setJobs(j))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  async function toggleSave(jobId) {
    try {
      await jobTrackerApi.toggleSave(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
          <p className="text-slate-600">{jobs.length} jobs saved</p>
        </div>
        <Link to="/dashboard/jobs" className="px-4 py-2 rounded-lg font-medium text-primary border border-primary hover:bg-primary/5">
          Browse Jobs
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="p-12 rounded-xl bg-white border border-slate-200 text-center">
          <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-slate-600">No saved jobs. Browse jobs and save the ones you like.</p>
          <Link to="/dashboard/jobs" className="inline-block mt-4 text-primary font-medium">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 rounded-xl bg-white border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{job.title}</h3>
                  <p className="text-slate-600">{job.company} · {job.location}</p>
                  <p className="text-sm text-slate-500">{job.salaryRange}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleSave(job.id)} className="p-2 rounded text-primary">
                    <Bookmark className="w-5 h-5 fill-current" />
                  </button>
                  {job.applyUrl && (
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-white bg-primary hover:opacity-90 text-sm">
                      Apply <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
