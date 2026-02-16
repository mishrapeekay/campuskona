import client from './client'

export const fetchInvestorDashboard = (params = {}) => {
  return client.get('/analytics/investor/dashboard/', { params })
}

export const refreshInvestorDashboard = () => {
  return client.post('/analytics/investor/refresh/')
}

export const getPrincipalHealth = () => {
  return client.get('/analytics/principal/health-score/')
}

export const analyticsAPI = {
  fetchInvestorDashboard,
  refreshInvestorDashboard,
  getPrincipalHealth
}
