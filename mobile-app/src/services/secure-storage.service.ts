
import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '@/constants';

class SecureStorageService {
    /**
     * Set authentication tokens securely
     */
    async setTokens(accessToken: string, refreshToken: string): Promise<boolean> {
        try {
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
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'auth_service' });
            if (credentials && credentials.password) {
                const tokens = JSON.parse(credentials.password);
                return tokens.accessToken;
            }
            return null;
        } catch (error) {
            console.error('SecureStorage: Error getting access token', error);
            return null;
        }
    }

    /**
     * Get refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'auth_service' });
            if (credentials && credentials.password) {
                const tokens = JSON.parse(credentials.password);
                return tokens.refreshToken;
            }
            return null;
        } catch (error) {
            console.error('SecureStorage: Error getting refresh token', error);
            return null;
        }
    }

    /**
     * Clear tokens (Logout)
     */
    async clearTokens(): Promise<boolean> {
        try {
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
