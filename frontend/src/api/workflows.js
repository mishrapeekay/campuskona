import client from './client'

export const fetchWorkflowRequests = (params = {}) => {
  return client.get('/workflows/', { params })
}

export const fetchWorkflowRequest = (id) => {
  return client.get(`/workflows/${id}/`)
}

export const approveWorkflowRequest = (id, data) => {
  return client.post(`/workflows/${id}/approve/`, data)
}

export const rejectWorkflowRequest = (id, data) => {
  return client.post(`/workflows/${id}/reject/`, data)
}

export const initiateWorkflowRequest = (id) => {
  return client.post(`/workflows/${id}/initiate/`)
}

export const fetchWorkflowConfigurations = () => {
  return client.get('/workflows/configurations/')
}
