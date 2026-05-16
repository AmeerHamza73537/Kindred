import { api } from './client.js';

export const initiateHandoff = (requestId) => api.post(`/handoff/${requestId}/initiate`);
export const getHandoffByRequest = (requestId) => api.get(`/handoff/request/${requestId}`);
export const getHandoffDocument = (id) => api.get(`/handoff/document/${id}`);
export const setPickupDetails = (id, body) => api.patch(`/handoff/${id}/set-pickup-details`, body);
export const confirmPickup = (id) => api.patch(`/handoff/${id}/confirm-pickup`);
export const verifyCode = (id, code) => api.patch(`/handoff/${id}/verify-code`, { code });
export const confirmReturn = (id, step) => api.patch(`/handoff/${id}/confirm-return`, { step });
