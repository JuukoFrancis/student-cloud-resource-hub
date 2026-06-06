import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://student-cloud-resource-hub-8.onrender.com'
// const API_BASE_URL = 'https://student-cloud-resource-hub-8.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}')
    if (tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const tokens = JSON.parse(localStorage.getItem('tokens') || '{}')
      if (tokens.refresh) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh/`,
            { refresh: tokens.refresh }
          )

          const newTokens = {
            access: response.data.access,
            refresh: response.data.refresh || tokens.refresh,
          }
          localStorage.setItem('tokens', JSON.stringify(newTokens))

          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('tokens')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (data) => api.post('/api/auth/login/', data),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/', data),
}

// ──────────────────────────────────────────────
// Resources API
// ──────────────────────────────────────────────

export const resourcesAPI = {
  list: (params) => api.get('/api/resources/', { params }),
  get: (id) => api.get(`/api/resources/${id}/`),
  upload: (formData) =>
    api.post('/api/resources/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.patch(`/api/resources/${id}/`, data),
  delete: (id) => api.delete(`/api/resources/${id}/`),
  download: (id) => api.get(`/api/resources/${id}/download/`),
  myUploads: (params) => api.get('/api/resources/my_uploads/', { params }),
  search: (params) => api.get('/api/resources/search/', { params }),
}

// ──────────────────────────────────────────────
// Sharing API
// ──────────────────────────────────────────────

export const sharingAPI = {
  share: (data) => api.post('/api/resources/share/share/', data),
  sharedWithMe: () => api.get('/api/resources/share/shared-with-me/'),
  sharedByMe: () => api.get('/api/resources/share/shared-by-me/'),
  removeShare: (id) => api.delete(`/api/resources/share/${id}/`),
}

// ──────────────────────────────────────────────
// Dashboard API
// ──────────────────────────────────────────────

export const dashboardAPI = {
  stats: () => api.get('/api/dashboard/stats/'),
  adminStats: () => api.get('/api/dashboard/admin/'),
}

// ──────────────────────────────────────────────
// Admin API
// ──────────────────────────────────────────────

export const adminAPI = {
  listUsers: (params) => api.get('/api/admin/users/', { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}/`),
  updateUser: (id, data) => api.patch(`/api/admin/users/${id}/`, data),
  deactivateUser: (id) => api.delete(`/api/admin/users/${id}/`),
  deleteResource: (id) => api.delete(`/api/admin/resources/${id}/`),
  getActivityLogs: (params) => api.get('/api/admin/activity/', { params }),
}

export default api
