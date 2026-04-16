import client from './axiosClient';

export const getTasks   = (params) => client.get('/api/v1/tasks', { params });
export const getTask    = (id)     => client.get(`/api/v1/tasks/${id}`);
export const createTask = (data)   => client.post('/api/v1/tasks', data);
export const updateTask = (id, data) => client.put(`/api/v1/tasks/${id}`, data);
export const deleteTask = (id)     => client.delete(`/api/v1/tasks/${id}`);
