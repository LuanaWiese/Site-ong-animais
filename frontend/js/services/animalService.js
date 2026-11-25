/**
 * animalService.js - Animal CRUD service
 */

const animalService = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await api.get(`/animais${query ? '?' + query : ''}`);
        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/animais/${id}`);
        return response.data;
    },

    async create(formData) {
        const response = await api.post('/animais', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async update(id, formData) {
        const response = await api.put(`/animais/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/animais/${id}`);
        return response.data;
    }
};
