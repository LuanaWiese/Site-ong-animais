/**
 * denunciaService.js - Animal abuse reports service
 */

const denunciaService = {
    async create(formData) {
        const response = await api.post('/denuncias', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async getAll() {
        const response = await api.get('/denuncias');
        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/denuncias/${id}`);
        return response.data;
    },

    async updateStatus(id, data) {
        const response = await api.put(`/denuncias/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/denuncias/${id}`);
        return response.data;
    }
};
