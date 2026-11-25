/**
 * api.js - Base Axios client for Grupo de Resgates
 * Automatically injects JWT token from localStorage on every request.
 */

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Request interceptor: inject token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: normalize errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            // If unauthorized, clear token and redirect to login
            if (status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/login.html';
                }
            }
            const msg = data?.message || 'Ocorreu um erro inesperado.';
            return Promise.reject(new Error(msg));
        } else if (error.request) {
            return Promise.reject(new Error('Servidor indisponível. Verifique sua conexão.'));
        }
        return Promise.reject(error);
    }
);
