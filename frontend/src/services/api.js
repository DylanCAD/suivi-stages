import axios from 'axios';

// ── Instance axios configurée ──
const api = axios.create({
  baseURL:         'http://localhost:5000/api',
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Routes pour lesquelles on ne tente PAS de refresh ──
const NO_REFRESH_URLS = ['/auth/me', '/auth/refresh', '/auth/login'];

// ── Intercepteur RÉPONSE ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Ne pas tenter de refresh si :
    // - Ce n'est pas un 401
    // - On est déjà en train de retry
    // - La requête concerne une route auth (évite la boucle infinie)
    const isAuthRoute = NO_REFRESH_URLS.some(url => original.url?.includes(url));

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        return api(original);
      } catch {
        // Refresh échoué → redirige vers login seulement si pas déjà sur /login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════
export const authAPI = {
  login:          (data)  => api.post('/auth/login', data),
  logout:         ()      => api.post('/auth/logout'),
  getMe:          ()      => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)  => api.post('/auth/reset-password', data),
  contactAdmin:   (data)  => api.post('/auth/contact-admin', data),

  verifyOTP: (data) => api.post('/auth/verify-otp', data),
};

// ════════════════════════════════════════════════
// STAGES
// ════════════════════════════════════════════════
export const stageAPI = {
  getAll:        (params)   => api.get('/stages', { params }),
  getById:       (id)       => api.get(`/stages/${id}`),
  create:        (data)     => api.post('/stages', data),
  update:        (id, data) => api.put(`/stages/${id}`, data),
  valider:       (id, data) => api.put(`/stages/${id}/valider`, data),
  changerStatut: (id, data) => api.put(`/stages/${id}/statut`, data),
  getStats:      ()         => api.get('/stages/stats'),
};

// ════════════════════════════════════════════════
// DOCUMENTS
// ════════════════════════════════════════════════
export const documentAPI = {
  getByStage: (idStage)       => api.get(`/stages/${idStage}/documents`),
  upload:     (idStage, form) => api.post(`/stages/${idStage}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  download:   (id)            => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete:     (id)            => api.delete(`/documents/${id}`),
};

// ════════════════════════════════════════════════
// UTILISATEURS
// ════════════════════════════════════════════════
export const userAPI = {
  getAll:         (params) => api.get('/users', { params }),
  create:         (data)   => api.post('/users', data),
  toggle:         (id)     => api.patch(`/users/${id}/toggle`),
  updateProfile:  (data)   => api.put('/users/me', data),
  changePassword: (data)   => api.put('/users/me/password', data),
};

// ════════════════════════════════════════════════
// ENTREPRISES
// ════════════════════════════════════════════════
export const entrepriseAPI = {
  getAll: ()     => api.get('/entreprises'),
  create: (data) => api.post('/entreprises', data),
};

// ════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════
export const notifAPI = {
  getAll:      (params) => api.get('/notifications', { params }),
  marquerLue:  (id)     => api.patch(`/notifications/${id}/lire`),
  marquerTout: ()       => api.patch('/notifications/lire-tout'),
};

export default api;