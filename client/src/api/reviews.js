import { api } from './client.js';

export const createReview = (body) => api.post('/reviews', body);
export const receivedReviews = (userId) => api.get(`/reviews/user/${userId}`);
export const getReviewForRequest = (requestId) => api.get(`/reviews/request/${requestId}`);
export const getReviewableRequest = (userId) => api.get(`/reviews/eligible/${userId}`);
