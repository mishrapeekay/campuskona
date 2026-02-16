import { apiClient } from './api/client';
import { API_CONFIG } from '@/constants';

export interface BrandingConfig {
    school_name: string;
    logo_light: string | null;
    logo_dark: string | null;
    icon: string | null;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    login_layout: 'SIMPLE' | 'SPLIT' | 'CENTERED';
    request_login: boolean;
}

export const brandingService = {
    getBranding: async (subdomain?: string): Promise<BrandingConfig> => {
        // If subdomain is provided, we send it in header
        const config: any = {};
        if (subdomain) {
            config.headers = { 'X-Tenant-Subdomain': subdomain };
        }

        // Construct simplified URL: replace /v1 at the end of BASE_URL with /mobile/v1
        // BASE_URL is likely .../api/v1
        // We need .../api/mobile/v1/branding/
        const mobileBaseUrl = API_CONFIG.BASE_URL.replace(/\/v1$/, '/mobile/v1');

        // We use full URL to override axios baseURL
        const response = await apiClient.get(`${mobileBaseUrl}/branding/`, config);
        return response;
    },
};
