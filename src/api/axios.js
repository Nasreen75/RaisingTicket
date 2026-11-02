import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout if token expired/invalid + general error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (backend down / no internet)
    if (!error.response) {
      error.friendlyMessage = 'Network error. Please check your connection and try again.';
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      error.friendlyMessage = error.response?.data?.message || 'Invalid credentials or session expired.';
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      error.friendlyMessage = 'You do not have permission to do that.';
    } else if (status === 404) {
      error.friendlyMessage = 'Requested data was not found.';
    } else if (status >= 500) {
      error.friendlyMessage = 'Server error. Please try again in a moment.';
    } else {
      error.friendlyMessage =
        error.response.data?.message || 'Something went wrong. Please try again.';
    }

    return Promise.reject(error);
  }
);

export default api;