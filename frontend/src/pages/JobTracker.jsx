import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobTrackerApi } from '../services/api';
import { Bookmark, ExternalLink, Settings, Star, List } from 'lucide-react';

const STATUS_VALUES = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    mode: '',
    experience: '',
    source: '',
    status: '',
    sort: 'latest',
    matchesOnly: false,
  });

  useEffect(() => {
    load();
  }, [filters.keyword, filters.location, filters.mode, filters.experience, filters.source, filters.status, filters.sort, filters.matchesOnly]);

  async function load() {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.matchesOnly) params.matchesOnly = 'true';
      const { jobs: j } = await jobTrackerApi.getJobs(params);
      setJobs(j);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(jobId) {
    try {
      await jobTrackerApi.toggleSave(jobId);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function setStatus(jobId, status) {
    try {
      await jobTrackerApi.setStatus(jobId, status);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Job Dashboard</h1>
          <p className="dashboard-page-subtitle">{jobs.length} jobs available</p>
        </div>
        <div className="dashboard-page-actions">
          <Link to="/dashboard/jobs/saved" className="dashboard-btn">
            <Bookmark size={16} strokeWidth={2} /> Saved
          </Link>
          <Link to="/dashboard/jobs/digest" className="dashboard-btn">
            <Star size={16} strokeWidth={2} /> Digest
          </Link>
          <Link to="/dashboard/jobs/settings" className="dashboard-btn dashboard-btn-primary">
            <Settings size={16} strokeWidth={2} /> Settings
          </Link>
        </div>
      </div>

      <div className="dashboard-filters">
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.keyword}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
          style={{ width: 180 }}
        />
        <select
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
        >
          <option value="">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Chennai">Chennai</option>
          <option value="Pune">Pune</option>
          <option value="Noida">Noida</option>
          <option value="Remote">Remote</option>
        </select>
        <select
          value={filters.mode}
          onChange={(e) => setFilters((f) => ({ ...f, mode: e.target.value }))}
        >
          <option value="">All Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Onsite">Onsite</option>
        </select>
        <select
          value={filters.experience}
          onChange={(e) => setFilters((f) => ({ ...f, experience: e.target.value }))}
        >
          <option value="">All Experience</option>
          <option value="Fresher">Fresher</option>
          <option value="0-1">0-1 years</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
        </select>
        <select
          value={filters.source}
          onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
        >
          <option value="">All Sources</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Naukri">Naukri</option>
          <option value="Indeed">Indeed</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Status</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
          <option value="match-score">Match Score (High to Low)</option>
          <option value="salary-high">Salary: High to Low</option>
          <option value="salary-low">Salary: Low to High</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={filters.matchesOnly}
            onChange={(e) => setFilters((f) => ({ ...f, matchesOnly: e.target.checked }))}
          />
          <span>Show only jobs above my threshold</span>
        </label>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="dashboard-empty">
          <List size={64} strokeWidth={1.5} />
          <p>No jobs found. Adjust filters or set preferences in Settings.</p>
          <Link to="/dashboard/jobs/settings" className="dashboard-link-primary">
            Go to Settings
          </Link>
        </div>
      ) : (
        <div className="dashboard-list">
          {jobs.map((job) => (
            <div key={job.id} className="dashboard-job-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h3>{job.title}</h3>
                  <p className="dashboard-job-card-meta">
                    {job.company} · {job.location} · {job.mode}
                  </p>
                  <p className="dashboard-job-card-sub">
                    {job.salaryRange} · {job.source}
                  </p>
                  {job.matchScore != null && job.matchScore > 0 && (
                    <span className="dashboard-match-badge">Match: {job.matchScore}</span>
                  )}
                </div>
                <div className="dashboard-job-card-actions">
                  {STATUS_VALUES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(job.id, s)}
                      className={`dashboard-job-status-btn${job.status === s ? ' active' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => toggleSave(job.id)}
                    style={{
                      padding: 8,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: job.saved ? '#8B0000' : '#94a3b8',
                    }}
                    aria-label={job.saved ? 'Unsave' : 'Save'}
                  >
                    <Bookmark
                      size={20}
                      strokeWidth={2}
                      fill={job.saved ? 'currentColor' : 'none'}
                    />
                  </button>
                  {job.applyUrl && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dashboard-job-apply-btn"
                    >
                      Apply <ExternalLink size={16} strokeWidth={2} />
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
