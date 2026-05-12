/**
 * API service - all backend calls
 *
 * Base URL: same-origin `/api` (Vite proxies to the backend in dev/preview).
 * Override with VITE_API_URL when the UI is hosted separately.
 * Accepts `http://host:5000` or `http://host:5000/api` — normalized to end with `/api`.
 */
function getApiBase() {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (!env) return '/api';
  const base = env.replace(/\/$/, '');
  if (base.endsWith('/api')) return base;
  return `${base}/api`;
}

const API = getApiBase();

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
    console.error('[api] Network error', path, err);
    throw new Error(err.message === 'Failed to fetch' ? 'Unable to connect. Please check your connection and try again.' : (err.message || 'Network error'));
  }

  const rawText = await res.text();
  const contentType = res.headers.get('content-type') || '';

  /** SPA hosts sometimes return index.html for /api/* with 200 OK — detect and surface a clear error */
  const looksLikeHtml =
    rawText.trimStart().startsWith('<!') ||
    rawText.trimStart().startsWith('<html') ||
    contentType.includes('text/html');

  let data = {};
  if (rawText.length > 0 && !looksLikeHtml) {
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('[api] Invalid JSON from', `${API}${path}`, parseErr, rawText.slice(0, 200));
      throw new Error(res.ok ? 'Invalid response from server.' : (res.statusText || 'Request failed'));
    }
  } else if (rawText.length > 0 && looksLikeHtml) {
    console.error('[api] Expected JSON but received HTML from', `${API}${path}`, '(wrong rewrite/proxy or API offline?)');
    throw new Error(
      'Could not reach the API (received the web app instead of JSON). Run the backend on port 5000, use npm run dev for both servers, or set VITE_API_URL to your API base.'
    );
  }

  if (!res.ok) {
    const msg = data.error || data.message || res.statusText || 'Request failed';
    console.error('[api]', res.status, path, msg);
    throw new Error(msg);
  }

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
