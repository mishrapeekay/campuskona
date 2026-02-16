import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading Spinner Component
 */
const LoadingSpinner = ({
    size = 'md',
    color = 'primary',
    fullScreen = false,
    text = '',
    className = '',
}) => {
    // Size styles
    const sizeStyles = {
        xs: 'h-4 w-4',
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    // Color styles
    const colorStyles = {
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        success: 'text-green-600',
        danger: 'text-red-600',
        warning: 'text-yellow-600',
        white: 'text-white',
    };

    const spinnerClasses = `animate-spin ${sizeStyles[size]} ${colorStyles[color]}`;

    const Spinner = () => (
        <svg
            className={spinnerClasses}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                <div className="flex flex-col items-center">
                    <Spinner />
                    {text && (
                        <p className="mt-4 text-gray-700 font-medium">{text}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="flex flex-col items-center">
                <Spinner />
                {text && (
                    <p className="mt-2 text-gray-700 text-sm">{text}</p>
                )}
            </div>
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
    fullScreen: PropTypes.bool,
    text: PropTypes.string,
    className: PropTypes.string,
};

export default LoadingSpinner;
