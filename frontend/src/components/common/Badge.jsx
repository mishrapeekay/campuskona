import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component for status indicators
 */
const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    rounded = false,
    className = '',
}) => {
    // Base styles
    const baseStyles = 'inline-flex items-center font-medium';

    // Variant styles
    const variantStyles = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-cyan-100 text-cyan-800',
        purple: 'bg-purple-100 text-purple-800',
        pink: 'bg-pink-100 text-pink-800',
    };

    // Size styles
    const sizeStyles = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-3.5 py-1.5 text-sm',
    };

    // Rounded styles
    const roundedStyles = rounded ? 'rounded-full' : 'rounded';

    // Combine all styles
    const badgeClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${roundedStyles} ${className}`;

    return (
        <span className={badgeClasses}>
            {children}
        </span>
    );
};

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['default', 'primary', 'success', 'danger', 'warning', 'info', 'purple', 'pink']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    rounded: PropTypes.bool,
    className: PropTypes.string,
};

export default Badge;
