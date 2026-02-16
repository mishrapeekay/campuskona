import client from './client'

export const fetchExceptions = (params = {}) => {
    return client.get('/core/exceptions/dashboard/', { params })
}
