import { api } from './client.js';

export const sendGratitude = (body) => api.post('/gratitude', body);
export const receivedGratitude = (userId) => api.get(`/gratitude/received/${userId}`);
export const sentGratitude = (userId) => api.get(`/gratitude/sent/${userId}`);
