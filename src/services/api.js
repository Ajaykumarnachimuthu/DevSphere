/**
 * DEVSphere Centralized API Client & Service Layer
 * Connects Frontend (React SPA) to Spring Boot REST Backend
 */

const defaultBaseUrl = import.meta.env?.PROD
  ? 'https://devsphere-backend-vjqq.onrender.com'
  : 'http://localhost:8080';
const rawBase = (import.meta.env?.VITE_API_BASE_URL || defaultBaseUrl).replace(/\/+$/, '');
const API_BASE_URL = rawBase.endsWith('/api/v1') ? rawBase.slice(0, -7) : rawBase;

export function getAuthToken() {
  return localStorage.getItem('jwt_token') || null;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('jwt_token', token);
  } else {
    localStorage.removeItem('jwt_token');
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const isPublicAuth = endpoint.startsWith('/api/v1/auth/register') || endpoint.startsWith('/api/v1/auth/login');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && !isPublicAuth ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.details = data?.details;
      throw err;
    }

    return data;
  } catch (error) {
    // If backend is unreachable or network error, rethrow so callers can handle or fallback
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Authentication Service
// -----------------------------------------------------------------------------
export const authApi = {
  async register(username, email, password) {
    const res = await request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (res?.token) {
      setAuthToken(res.token);
      localStorage.setItem('loggedInUser', res.user?.email || email);
    }
    return res;
  },

  async login(email, password) {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.token) {
      setAuthToken(res.token);
      localStorage.setItem('loggedInUser', res.user?.email || email);
    }
    return res;
  },

  async getCurrentUser() {
    return request('/api/v1/auth/me');
  },

  async logout() {
    try {
      await request('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('currentUser');
    }
  },
};

// -----------------------------------------------------------------------------
// Developers Service
// -----------------------------------------------------------------------------
export const developersApi = {
  async getAll({ query = '', page = 0, size = 20 } = {}) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    params.append('page', page);
    params.append('size', size);
    return request(`/api/v1/developers?${params.toString()}`);
  },

  async getMyProfile() {
    return request('/api/v1/developers/me');
  },

  async updateMyProfile(data) {
    return request('/api/v1/developers/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getById(id) {
    return request(`/api/v1/developers/${id}`);
  },

  async getByName(name) {
    return request(`/api/v1/developers/by-name?name=${encodeURIComponent(name)}`);
  },

  async toggleConnect(id) {
    return request(`/api/v1/developers/${id}/connect`, {
      method: 'POST',
    });
  },

  async getStats(id) {
    return request(`/api/v1/developers/${id}/stats`);
  },
};

// -----------------------------------------------------------------------------
// Blogs Service
// -----------------------------------------------------------------------------
export const blogsApi = {
  async getAll({ category = 'All', search = '', page = 0, size = 20 } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('size', size);
    return request(`/api/v1/blogs?${params.toString()}`);
  },

  async getById(id) {
    return request(`/api/v1/blogs/${id}`);
  },

  async create({ title, category, content, tech, tags, draft = false, subtitle, coverImage, difficulty, prerequisites, takeaways }) {
    return request('/api/v1/blogs', {
      method: 'POST',
      body: JSON.stringify({ title, category, content, tech, tags, draft, subtitle, coverImage, difficulty, prerequisites, takeaways }),
    });
  },

  async getDrafts() {
    return request('/api/v1/blogs/drafts');
  },

  async update(id, data) {
    return request(`/api/v1/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return request(`/api/v1/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleLike(id) {
    return request(`/api/v1/blogs/${id}/like`, {
      method: 'POST',
    });
  },

  async toggleBookmark(id) {
    return request(`/api/v1/blogs/${id}/bookmark`, {
      method: 'POST',
    });
  },

  async getComments(id) {
    return request(`/api/v1/blogs/${id}/comments`);
  },

  async addComment(id, { content, parentId = null }) {
    return request(`/api/v1/blogs/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  },

  async deleteComment(commentId) {
    return request(`/api/v1/blogs/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  async getTrails() {
    return request('/api/v1/blogs/trails');
  },

  async getTrailById(id) {
    return request(`/api/v1/blogs/trails/${id}`);
  },
};

// -----------------------------------------------------------------------------
// Projects Service
// -----------------------------------------------------------------------------
export const projectsApi = {
  async getAll({ category = 'All', search = '', sort = 'Latest', page = 0, size = 20 } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    params.append('page', page);
    params.append('size', size);
    return request(`/api/v1/projects?${params.toString()}`);
  },

  async getById(id) {
    return request(`/api/v1/projects/${id}`);
  },

  async create(data) {
    return request('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return request(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return request(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleLike(id) {
    return request(`/api/v1/projects/${id}/like`, {
      method: 'POST',
    });
  },

  async toggleBookmark(id) {
    return request(`/api/v1/projects/${id}/bookmark`, {
      method: 'POST',
    });
  },

  async incrementView(id) {
    return request(`/api/v1/projects/${id}/view`, {
      method: 'POST',
    });
  },

  async getGitHub(id) {
    return request(`/api/v1/projects/${id}/github`);
  },

  async getComments(id) {
    return request(`/api/v1/projects/${id}/comments`);
  },

  async addComment(id, { content, parentId = null }) {
    return request(`/api/v1/projects/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  },

  async deleteComment(commentId) {
    return request(`/api/v1/projects/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// -----------------------------------------------------------------------------
// Platform Overview Stats Service
// -----------------------------------------------------------------------------
export const statsApi = {
  async getOverview() {
    return request('/api/v1/stats/overview');
  },
};


// -----------------------------------------------------------------------------
// Media & File Upload Service
// -----------------------------------------------------------------------------
export const filesApi = {
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || err?.message || `Upload failed with status ${res.status}`);
    }

    return res.json();
  },
};
