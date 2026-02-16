/**
 * API service - all backend calls
 */
const API = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  let res;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error(err.message === 'Failed to fetch' ? 'Unable to connect. Please check your connection and try again.' : (err.message || 'Network error'));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || res.statusText || 'Request failed');
  return data;
}

export const authApi = {
  register: (email, password, name) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
};

export const resumeApi = {
  list: () => request('/resumes'),
  get: (id) => request(`/resumes/${id}`),
  create: (data) => request('/resumes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/resumes/${id}`, { method: 'DELETE' }),
};

export const jobTrackerApi = {
  getJobs: (params) => request('/job-tracker/jobs?' + new URLSearchParams(params || {}).toString()),
  getSaved: () => request('/job-tracker/saved'),
  getPreferences: () => request('/job-tracker/preferences'),
  savePreferences: (prefs) => request('/job-tracker/preferences', { method: 'POST', body: JSON.stringify(prefs) }),
  toggleSave: (jobId) => request(`/job-tracker/saved/${jobId}`, { method: 'POST' }),
  setStatus: (jobId, status) => request(`/job-tracker/status/${jobId}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  generateDigest: () => request('/job-tracker/digest/generate', { method: 'POST' }),
  getDigest: () => request('/job-tracker/digest'),
};

export const placementPrepApi = {
  analyze: (company, role, jdText) => request('/placement-prep/analyze', { method: 'POST', body: JSON.stringify({ company, role, jdText }) }),
  list: () => request('/placement-prep/preparations'),
  get: (id) => request(`/placement-prep/preparations/${id}`),
};
