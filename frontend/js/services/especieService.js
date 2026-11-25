/**
 * especieService.js - Species CRUD service
 */

const especieService = {
    async getAll() {
        const response = await api.get('/especies');
        return response.data;
    },

    async create(data) {
        const response = await api.post('/especies', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/especies/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/especies/${id}`);
        return response.data;
    }
};
