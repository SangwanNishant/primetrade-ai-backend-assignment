import client from './axiosClient';

export const getUsers       = ()           => client.get('/api/v1/users');
export const updateUserRole = (id, role)   => client.patch(`/api/v1/users/${id}/role`, { role });
export const deleteUser     = (id)         => client.delete(`/api/v1/users/${id}`);
