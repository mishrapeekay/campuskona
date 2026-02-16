/**
 * Biometric Authentication Service
 *
 * Handles Face ID, Touch ID, and fingerprint authentication.
 * Provides secure storage for biometric credentials.
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// Secure storage for biometric preferences
const secureStorage = new MMKV({
  id: 'biometric-storage',
  encryptionKey: 'your-encryption-key-here', // TODO: Generate secure key
});

export interface BiometricCapabilities {
  available: boolean;
  biometryType: BiometryTypes | null;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;
  private readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private readonly BIOMETRIC_CONFIGURED_KEY = 'biometric_configured';

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: false, // Only allow biometrics, not PIN/pattern
    });
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkAvailability(): Promise<BiometricCapabilities> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();

      if (!available) {
        return {
          available: false,
          biometryType: null,
          error: 'Biometric authentication is not available on this device',
        };
      }

      return {
        available: true,
        biometryType: biometryType as BiometryTypes,
      };
    } catch (error: any) {
      console.error('Failed to check biometric availability:', error);
      return {
        available: false,
        biometryType: null,
        error: error.message || 'Failed to check biometric availability',
      };
    }
  }

  /**
   * Get human-readable biometry type name
   */
  getBiometryTypeName(biometryType: BiometryTypes | null): string {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return 'Fingerprint';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.checkAvailability();

      if (!capabilities.available) {
        return {
          success: false,
          error: capabilities.error || 'Biometric authentication not available',
        };
      }

      const biometryTypeName = this.getBiometryTypeName(capabilities.biometryType);
      const defaultPrompt = `Authenticate with ${biometryTypeName}`;

      const { success, error } = await this.rnBiometrics.simplePrompt({
        promptMessage: promptMessage || defaultPrompt,
        cancelButtonText: 'Cancel',
      });

      if (success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: error || 'Authentication failed',
        };
      }
    } catch (error: any) {
      console.error('Biometric authentication failed:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  /**
   * Create biometric keys (for advanced scenarios)
   */
  async createKeys(): Promise<{ publicKey: string } | null> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      return { publicKey };
    } catch (error) {
      console.error('Failed to create biometric keys:', error);
      return null;
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Failed to delete biometric keys:', error);
      return false;
    }
  }

  /**
   * Check if biometric keys exist
   */
  async biometricKeysExist(): Promise<boolean> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Failed to check biometric keys:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  async enableBiometricAuth(): Promise<boolean> {
    try {
      const capabilities = await this.checkAvailability();

      if (!capabilities.available) {
        throw new Error(capabilities.error || 'Biometric authentication not available');
      }

      // Test authentication before enabling
      const authResult = await this.authenticate('Enable biometric authentication');

      if (authResult.success) {
        secureStorage.set(this.BIOMETRIC_ENABLED_KEY, true);
        secureStorage.set(this.BIOMETRIC_CONFIGURED_KEY, true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication for the app
   */
  async disableBiometricAuth(): Promise<void> {
    try {
      secureStorage.set(this.BIOMETRIC_ENABLED_KEY, false);
      await this.deleteKeys();
    } catch (error) {
      console.error('Failed to disable biometric auth:', error);
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  isBiometricEnabled(): boolean {
    try {
      return secureStorage.getBoolean(this.BIOMETRIC_ENABLED_KEY) || false;
    } catch (error) {
      console.error('Failed to check biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication has been configured
   */
  isBiometricConfigured(): boolean {
    try {
      return secureStorage.getBoolean(this.BIOMETRIC_CONFIGURED_KEY) || false;
    } catch (error) {
      console.error('Failed to check biometric configured status:', error);
      return false;
    }
  }

  /**
   * Get biometric prompt messages based on context
   */
  getPromptMessages(context: 'login' | 'payment' | 'settings' | 'general'): {
    promptMessage: string;
    cancelButtonText: string;
  } {
    const messages = {
      login: {
        promptMessage: 'Authenticate to login to your account',
        cancelButtonText: 'Use Password',
      },
      payment: {
        promptMessage: 'Authenticate to confirm payment',
        cancelButtonText: 'Cancel Payment',
      },
      settings: {
        promptMessage: 'Authenticate to access settings',
        cancelButtonText: 'Cancel',
      },
      general: {
        promptMessage: 'Authenticate to continue',
        cancelButtonText: 'Cancel',
      },
    };

    return messages[context];
  }

  /**
   * Authenticate for specific context with custom messages
   */
  async authenticateForContext(
    context: 'login' | 'payment' | 'settings' | 'general'
  ): Promise<BiometricAuthResult> {
    const messages = this.getPromptMessages(context);
    return this.authenticate(messages.promptMessage);
  }

  /**
   * Check if device supports biometrics and show appropriate message
   */
  async getSupportMessage(): Promise<string> {
    const capabilities = await this.checkAvailability();

    if (!capabilities.available) {
      if (Platform.OS === 'ios') {
        return 'Your device does not support Face ID or Touch ID. Please use password authentication.';
      } else {
        return 'Your device does not support fingerprint authentication. Please use password authentication.';
      }
    }

    const biometryTypeName = this.getBiometryTypeName(capabilities.biometryType);

    if (capabilities.biometryType === BiometryTypes.FaceID) {
      return `${biometryTypeName} is available. You can enable it in settings for faster login.`;
    } else if (capabilities.biometryType === BiometryTypes.TouchID) {
      return `${biometryTypeName} is available. You can enable it in settings for faster login.`;
    } else {
      return `${biometryTypeName} is available. You can enable it in settings for faster login.`;
    }
  }
}

// Export singleton instance
export const biometricService = new BiometricService();

export default biometricService;
