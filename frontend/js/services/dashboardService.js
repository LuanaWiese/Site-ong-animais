/**
 * dashboardService.js - Dashboard statistics service
 */

const dashboardService = {
    async getStats() {
        const response = await api.get('/dashboard');
        return response.data;
    }
};
