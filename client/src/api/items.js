import { api } from './client.js';

export const listItems = (params) => api.get('/items', { params });
export const listMyItems = (params) => api.get('/items', { params: { ...params, mine: true } });
export const listByOwner = (ownerId, params) =>
  api.get('/items', { params: { ...params, owner: ownerId } });
export const getItem = (id) => api.get(`/items/${id}`);
export const createItem = (formData) =>
  api.post('/items', formData, { headers: { 'Content-Type': undefined } });
export const updateItem = (id, formData) =>
  api.put(`/items/${id}`, formData, { headers: { 'Content-Type': undefined } });
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const patchItemStatus = (id, status) => api.patch(`/items/${id}/status`, { status });
export const getAvailability = (id) => api.get(`/items/${id}/availability`);
export const postAvailability = (id, dates) => api.post(`/items/${id}/availability`, { dates });
export const getBorrowed = () => api.get('/items/borrowed');
export const getGifted = () => api.get('/items/gifted');
