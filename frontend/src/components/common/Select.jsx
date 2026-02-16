import React from 'react';
import PropTypes from 'prop-types';

/**
 * Select Component - Reusable dropdown select input
 */
const Select = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    placeholder,
    required = false,
    disabled = false,
    error,
    className = '',
}) => {
    const id = name || `select-${Math.random().toString(36).substr(2, 9)}`;
    const baseClasses = `
        w-full px-3 py-2 border rounded-md
        focus:outline-none focus:ring-2 focus:ring-purple-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
        ${className}
    `;

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                required={required}
                disabled={disabled}
                className={baseClasses.trim()}
            >
                {placeholder ? (
                    <option value="">{placeholder}</option>
                ) : (
                    <option value="">Select {label || 'Option'}</option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

Select.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    className: PropTypes.string,
};

export default Select;
