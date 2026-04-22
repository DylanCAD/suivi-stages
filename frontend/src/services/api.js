import axios from 'axios';

// ── Instance axios configurée ──
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur requête : ajoute le token JWT automatiquement ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Intercepteur réponse : gère l'expiration du token ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Pas de refresh token');

        const { data } = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          { refreshToken }
        );

        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);

      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════
export const authAPI = {
  login:           (data)  => api.post('/auth/login', data),
  logout:          ()      => api.post('/auth/logout'),
  getMe:           ()      => api.get('/auth/me'),
  refresh:         (token) => api.post('/auth/refresh', { refreshToken: token }),

  // 🔐 MOT DE PASSE OUBLIÉ
  forgotPassword:  (email) => api.post('/auth/forgot-password', { email }),

  // 🔐 RESET MOT DE PASSE
  resetPassword:   (data)  => api.post('/auth/reset-password', data),

  contactAdmin: (data) => api.post('/auth/contact-admin', data),
};

// ════════════════════════════════════════════════
// STAGES
// ════════════════════════════════════════════════
export const stageAPI = {
  getAll:   (params) => api.get('/stages', { params }),
  getById:  (id)     => api.get(`/stages/${id}`),
  create:   (data)   => api.post('/stages', data),
  update:   (id, data) => api.put(`/stages/${id}`, data),
  valider:  (id, data) => api.put(`/stages/${id}/valider`, data),
  getStats: ()       => api.get('/stages/stats'),
};

// ════════════════════════════════════════════════
// DOCUMENTS
// ════════════════════════════════════════════════
export const documentAPI = {
  getByStage: (idStage) => api.get(`/stages/${idStage}/documents`),
  upload: (idStage, formData) =>
    api.post(`/stages/${idStage}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/documents/${id}`),
};

// ════════════════════════════════════════════════
// UTILISATEURS
// ════════════════════════════════════════════════
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  toggle: (id) => api.patch(`/users/${id}/toggle`),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
};

// ════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════
export const notifAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  marquerLue: (id) => api.patch(`/notifications/${id}/lire`),
  marquerTout: () => api.patch('/notifications/lire-tout'),
};

export default api;