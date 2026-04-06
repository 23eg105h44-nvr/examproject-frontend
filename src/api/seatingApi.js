import axios from 'axios';

const api = axios.create({
  baseURL: 'https://examproject-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

export const generateSeating = (payload) => api.post('/generateSeating', payload);
export const searchStudent   = (rollNo)  => api.get(`/student/${rollNo}`);
export default api;
