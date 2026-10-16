import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export function getErrorMessage(err) {
  const d = err.response?.data;
  if (d?.details && typeof d.details === 'object') return Object.values(d.details).join(', ');
  return d?.message || err.message || 'Something went wrong';
}

export const createEntry = (data) => api.post('/milk', data).then((r) => r.data.data);
export const getEntries = (params) => api.get('/milk', { params }).then((r) => r.data);
export const getEntry = (id) => api.get(`/milk/${id}`).then((r) => r.data.data);
export const updateEntry = (id, data) => api.put(`/milk/${id}`, data).then((r) => r.data.data);
export const deleteEntry = (id) => api.delete(`/milk/${id}`).then((r) => r.data);
export const getSummary = () => api.get('/reports/summary').then((r) => r.data.data);
export const getRangeReport = (params) => api.get('/reports/date-range', { params }).then((r) => r.data.data);

export async function downloadExport(type, params) {
  const ext = type === 'excel' ? 'xlsx' : type;
  const res = await api.get(`/reports/export/${type}`, { params, responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `milk-report-${params.startDate}-to-${params.endDate}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
