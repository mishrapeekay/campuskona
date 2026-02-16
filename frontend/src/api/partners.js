import client from './client'

export const fetchPartnerDashboard = () => {
    return client.get('/partners/dashboard/')
}

export const fetchLeads = (params = {}) => {
    return client.get('/partners/leads/', { params })
}

export const createLead = (data) => {
    return client.post('/partners/leads/', data)
}

export const fetchCommissions = (params = {}) => {
    return client.get('/partners/commissions/', { params })
}

export const fetchPayouts = (params = {}) => {
    return client.get('/partners/payouts/', { params })
}

export const fetchPartnerLeaderboard = () => {
    return client.get('/partners/leaderboard/')
}
