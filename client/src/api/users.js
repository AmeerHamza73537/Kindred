import { api } from './client.js';

export const getMe = (config) => api.get('/users/me', config);
export const updateMe = (formData) =>
  api.put('/users/me', formData, { headers: { 'Content-Type': undefined } });
export const getUser = (id) => api.get(`/users/${id}`);
export const getNearby = (params) => api.get('/users/nearby', { params });
