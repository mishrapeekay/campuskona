import client from './client';

export const getSuperAdminDashboardStats = () => {
    return client.get('/tenants/dashboard/stats/');
};

export const getPublicSchools = () => {
    return client.get('/tenants/public/list/');
};

export const getTenantsList = () => {
    return client.get('/tenants/schools/');
}
