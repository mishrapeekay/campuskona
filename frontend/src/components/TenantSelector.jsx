import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './TenantSelector.css';

const TenantSelector = () => {
    const [availableTenants, setAvailableTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(
        localStorage.getItem('selectedTenant') || ''
    );
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        const loadTenants = async () => {
            try {
                const userStr = localStorage.getItem('user');
                const currentSubdomain = localStorage.getItem('selectedTenant') || '';

                // Fetch all schools from the live public API (no auth required)
                const response = await apiClient.get('/tenants/public/list/');
                const allSchools = (response.data?.results || response.data || [])
                    // Exclude the internal "public" meta-tenant
                    .filter(s => s.subdomain !== 'public' && s.is_active)
                    .map(s => ({
                        subdomain: s.subdomain,
                        name: s.school_name,
                        code: s.school_code,
                        location: `${s.city}, ${s.state}`,
                    }));

                let filtered = allSchools;

                // Non-superadmin users only see the school they are logged into
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (!user.is_superuser) {
                        filtered = allSchools.filter(s => s.subdomain === currentSubdomain);
                    }
                }

                setAvailableTenants(filtered);

                // If current subdomain isn't in the allowed list, switch to first allowed
                if (filtered.length > 0 && !filtered.find(t => t.subdomain === currentSubdomain)) {
                    const first = filtered[0];
                    localStorage.setItem('selectedTenant', first.subdomain);
                    localStorage.setItem('tenant_subdomain', first.subdomain);
                    localStorage.setItem('tenant_name', first.name);
                    setSelectedTenant(first.subdomain);
                    setTimeout(() => window.location.reload(), 100);
                }
            } catch (err) {
                console.error('TenantSelector: failed to load schools', err);
                // On error, keep current tenant visible so the UI doesn't break
                const currentSubdomain = localStorage.getItem('selectedTenant') || '';
                const currentName = localStorage.getItem('tenant_name') || currentSubdomain;
                if (currentSubdomain) {
                    setAvailableTenants([{
                        subdomain: currentSubdomain,
                        name: currentName,
                        code: '',
                        location: '',
                    }]);
                }
            }
        };

        loadTenants();
    }, []);

    const currentTenant = availableTenants.find(t => t.subdomain === selectedTenant);

    const handleTenantChange = (subdomain) => {
        if (subdomain === selectedTenant) return;
        setIsChanging(true);
        const tenant = availableTenants.find(t => t.subdomain === subdomain);
        if (tenant) {
            localStorage.setItem('selectedTenant', subdomain);
            localStorage.setItem('tenant_subdomain', subdomain);
            localStorage.setItem('tenant_name', tenant.name);
            setTimeout(() => window.location.reload(), 300);
        }
    };

    // Don't render anything while loading
    if (availableTenants.length === 0) {
        return (
            <div className="tenant-selector">
                <span className="text-sm text-gray-500">Loading...</span>
            </div>
        );
    }

    // Single school — display only, no dropdown
    if (availableTenants.length === 1) {
        return (
            <div className="tenant-selector">
                <div className="tenant-info">
                    <span className="tenant-label">School:</span>
                    <span className="tenant-name">{currentTenant?.name}</span>
                </div>
                {currentTenant?.code && (
                    <div className="tenant-details">
                        <span className="tenant-code">{currentTenant.code}</span>
                        <span className="tenant-location">{currentTenant.location}</span>
                    </div>
                )}
            </div>
        );
    }

    // Multiple schools — show dropdown (super admin)
    return (
        <div className="tenant-selector">
            <div className="tenant-info">
                <span className="tenant-label">School:</span>
                <select
                    value={selectedTenant}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    className="tenant-dropdown"
                    disabled={isChanging}
                >
                    {availableTenants.map((tenant) => (
                        <option key={tenant.subdomain} value={tenant.subdomain}>
                            {tenant.name}
                        </option>
                    ))}
                </select>
            </div>
            {currentTenant && (
                <div className="tenant-details">
                    <span className="tenant-code">{currentTenant.code}</span>
                    <span className="tenant-location">{currentTenant.location}</span>
                </div>
            )}
            {isChanging && (
                <div className="tenant-loading">
                    <span>Switching school...</span>
                </div>
            )}
        </div>
    );
};

export default TenantSelector;
