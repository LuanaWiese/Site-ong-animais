/**
 * racaService.js - Breed CRUD service
 */

const racaService = {
    async getAll() {
        const response = await api.get('/racas');
        return response.data;
    },

    async create(data) {
        const response = await api.post('/racas', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/racas/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/racas/${id}`);
        return response.data;
    }
};
