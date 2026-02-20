
import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '@/constants';

class SecureStorageService {
    private accessTokenCache: string | null = null;
    private refreshTokenCache: string | null = null;
    private isCacheLoaded: boolean = false;

    /**
     * Load tokens from storage into memory cache
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'auth_service' });
            if (credentials && credentials.password) {
                const tokens = JSON.parse(credentials.password);
                this.accessTokenCache = tokens.accessToken || null;
                this.refreshTokenCache = tokens.refreshToken || null;
            } else {
                this.accessTokenCache = null;
                this.refreshTokenCache = null;
            }
        } catch (error) {
            // Ignore "No entry found" errors usually implies empty storage or first run
            this.accessTokenCache = null;
            this.refreshTokenCache = null;
        } finally {
            this.isCacheLoaded = true;
        }
    }

    /**
     * Set authentication tokens securely
     */
    async setTokens(accessToken: string, refreshToken: string): Promise<boolean> {
        try {
            // Update memory cache
            this.accessTokenCache = accessToken;
            this.refreshTokenCache = refreshToken;
            this.isCacheLoaded = true;

            // We store both tokens as a JSON string in the password field
            // The username can be a fixed identifier
            const tokens = JSON.stringify({ accessToken, refreshToken });
            await Keychain.setGenericPassword('auth_tokens', tokens, {
                service: 'auth_service',
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // IRS/DPDP compliance
            });
            return true;
        } catch (error) {
            console.error('SecureStorage: Error setting tokens', error);
            return false;
        }
    }

    /**
     * Get access token
     */
    async getAccessToken(): Promise<string | null> {
        if (!this.isCacheLoaded) {
            await this.loadFromStorage();
        }
        return this.accessTokenCache;
    }

    /**
     * Get refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        if (!this.isCacheLoaded) {
            await this.loadFromStorage();
        }
        return this.refreshTokenCache;
    }

    /**
     * Clear tokens (Logout)
     */
    async clearTokens(): Promise<boolean> {
        try {
            // Clear cache
            this.accessTokenCache = null;
            this.refreshTokenCache = null;
            this.isCacheLoaded = true;

            await Keychain.resetGenericPassword({ service: 'auth_service' });
            return true;
        } catch (error) {
            console.error('SecureStorage: Error clearing tokens', error);
            return false;
        }
    }
}

export const secureStorage = new SecureStorageService();
export default secureStorage;
