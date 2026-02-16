/**
 * Initialize tenant context for development/testing
 * This sets up a default tenant in localStorage
 */

export const initializeTenantContext = () => {
    // Check if tenant is already set
    const existingTenantId = localStorage.getItem('tenant_id');

    if (!existingTenantId) {
        // Set default tenant for development
        // TODO: Replace with actual tenant selection logic
        localStorage.setItem('tenant_id', '1');
        localStorage.setItem('tenant_subdomain', 'demo');
        localStorage.setItem('tenant_name', 'Demo School');

        console.log('✅ Tenant context initialized:', {
            tenant_id: '1',
            tenant_subdomain: 'demo',
            tenant_name: 'Demo School'
        });
    }
};

/**
 * Set tenant context
 */
export const setTenantContext = (tenantId, subdomain, name) => {
    localStorage.setItem('tenant_id', tenantId);
    localStorage.setItem('tenant_subdomain', subdomain);
    localStorage.setItem('tenant_name', name);

    console.log('✅ Tenant context set:', { tenantId, subdomain, name });
};

/**
 * Get current tenant context
 */
export const getTenantContext = () => {
    return {
        tenant_id: localStorage.getItem('tenant_id'),
        tenant_subdomain: localStorage.getItem('tenant_subdomain'),
        tenant_name: localStorage.getItem('tenant_name'),
    };
};

/**
 * Clear tenant context
 */
export const clearTenantContext = () => {
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('tenant_subdomain');
    localStorage.removeItem('tenant_name');

    console.log('🗑️ Tenant context cleared');
};

export default {
    initializeTenantContext,
    setTenantContext,
    getTenantContext,
    clearTenantContext,
};
