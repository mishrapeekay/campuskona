import { Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  PERMISSION = 'PERMISSION',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      if (isFatal) {
        this.handleFatalError(error);
      } else {
        this.handleError({
          type: ErrorType.UNKNOWN,
          message: error.message || 'An unexpected error occurred',
          details: error,
          timestamp: new Date(),
        });
      }
    });

    // Unhandled promise rejection handler
    const _tracking = require('promise/setimmediate/rejection-tracking');
    _tracking.enable({
      allRejections: true,
      onUnhandled: (id: string, error: Error) => {
        this.handleError({
          type: ErrorType.UNKNOWN,
          message: `Unhandled promise rejection: ${error.message}`,
          details: error,
          timestamp: new Date(),
        });
      },
    });
  }

  public handleError(error: AppError, showAlert: boolean = false): void {
    // Log error
    this.logError(error);

    // Send to crash reporting service (Sentry)
    if (__DEV__) {
      console.error('[ERROR]', error);
    } else {
      this.reportToSentry(error);
    }

    // Show user-friendly message
    if (showAlert) {
      this.showErrorAlert(error);
    }
  }

  private handleFatalError(error: Error): void {
    console.error('[FATAL ERROR]', error);

    // Report to Sentry
    this.reportToSentry({
      type: ErrorType.UNKNOWN,
      message: `Fatal error: ${error.message}`,
      details: error,
      timestamp: new Date(),
    });

    // Show alert to user
    Alert.alert(
      'Critical Error',
      'The app encountered a critical error and needs to restart. We apologize for the inconvenience.',
      [
        {
          text: 'Restart',
          onPress: () => {
            // TODO: Implement app restart
            // RNRestart.Restart();
          },
        },
      ],
      { cancelable: false }
    );
  }

  private logError(error: AppError): void {
    // Keep last 100 errors in memory
    this.errorLog.push(error);
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // TODO: Store errors in AsyncStorage for offline analysis
  }

  private reportToSentry(error: AppError): void {
    try {
      Sentry.captureException(new Error(error.message), {
        tags: {
          errorType: error.type,
          errorCode: error.code || 'N/A',
        },
        extra: error.details,
      });
    } catch (e) {
      console.error('Failed to report error to Sentry:', e);
    }
  }

  private showErrorAlert(error: AppError): void {
    const userMessage = this.getUserFriendlyMessage(error);

    Alert.alert(
      'Error',
      userMessage,
      [
        {
          text: 'Retry',
          onPress: () => {
            // TODO: Implement retry logic
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  }

  private getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Network connection error. Please check your internet connection and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Authentication failed. Please login again.';
      case ErrorType.VALIDATION:
        return error.message || 'Please check your input and try again.';
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      case ErrorType.PERMISSION:
        return 'Permission denied. Please check app permissions in settings.';
      case ErrorType.STORAGE:
        return 'Storage error. Please check available storage space.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  public handleAPIError(error: any): AppError {
    let appError: AppError;

    if (error.response) {
      // Server responded with error
      const status = error.response.status;

      if (status === 401 || status === 403) {
        appError = {
          type: ErrorType.AUTHENTICATION,
          message: 'Authentication failed',
          code: status.toString(),
          details: error.response.data,
          timestamp: new Date(),
        };
      } else if (status >= 400 && status < 500) {
        appError = {
          type: ErrorType.VALIDATION,
          message: error.response.data?.message || 'Invalid request',
          code: status.toString(),
          details: error.response.data,
          timestamp: new Date(),
        };
      } else if (status >= 500) {
        appError = {
          type: ErrorType.SERVER,
          message: 'Server error',
          code: status.toString(),
          details: error.response.data,
          timestamp: new Date(),
        };
      } else {
        appError = {
          type: ErrorType.UNKNOWN,
          message: error.message,
          code: status.toString(),
          details: error.response.data,
          timestamp: new Date(),
        };
      }
    } else if (error.request) {
      // Request made but no response
      appError = {
        type: ErrorType.NETWORK,
        message: 'Network error',
        details: error.request,
        timestamp: new Date(),
      };
    } else {
      // Something else happened
      appError = {
        type: ErrorType.UNKNOWN,
        message: error.message || 'Unknown error',
        details: error,
        timestamp: new Date(),
      };
    }

    this.handleError(appError);
    return appError;
  }

  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

export default ErrorHandler.getInstance();
