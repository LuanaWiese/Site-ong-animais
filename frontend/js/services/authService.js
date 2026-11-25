/**
 * authService.js - Authentication service
 */

const authService = {
    async login(usuario, senha) {
        const response = await api.post('/auth/login', { usuario, senha });
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        return { token, user };
    },

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login.html';
    },

    isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    },

    getUser() {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
};
