import client from './axiosClient';

export const loginUser    = (data) => client.post('/api/v1/auth/login', data);
export const registerUser = (data) => client.post('/api/v1/auth/register', data);
export const getMe        = ()     => client.get('/api/v1/auth/me');
