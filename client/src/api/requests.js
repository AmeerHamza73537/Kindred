import { api } from './client.js';

export const getRequest = (id) => api.get(`/requests/${id}`);
export const createRequest = (body) => api.post('/requests', body);
export const incoming = (config) => api.get('/requests/incoming', config);
export const outgoing = (config) => api.get('/requests/outgoing', config);
export const approve = (id) => api.patch(`/requests/${id}/approve`);
export const reject = (id) => api.patch(`/requests/${id}/reject`);
export const cancel = (id) => api.patch(`/requests/${id}/cancel`);
