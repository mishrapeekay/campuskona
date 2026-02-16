import { toast } from 'react-toastify';

/**
 * Toast notification utility
 * Wrapper around react-toastify for consistent notifications
 */

const defaultOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

export const showToast = {
    success: (message, options = {}) => {
        toast.success(message, { ...defaultOptions, ...options });
    },

    error: (message, options = {}) => {
        toast.error(message, { ...defaultOptions, autoClose: 5000, ...options });
    },

    info: (message, options = {}) => {
        toast.info(message, { ...defaultOptions, ...options });
    },

    warning: (message, options = {}) => {
        toast.warning(message, { ...defaultOptions, ...options });
    },

    promise: (promise, messages, options = {}) => {
        return toast.promise(
            promise,
            {
                pending: messages.pending || 'Processing...',
                success: messages.success || 'Success!',
                error: messages.error || 'Something went wrong',
            },
            { ...defaultOptions, ...options }
        );
    },
};

// Helper to extract error message from various error formats
export const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
};

export default showToast;
