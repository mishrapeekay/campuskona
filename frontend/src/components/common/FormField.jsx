import React from 'react';
import PropTypes from 'prop-types';

/**
 * Form Field Component - Wrapper for form inputs
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    options = [], // For select inputs
    rows = 3, // For textarea
    accept, // For file inputs
    min,
    max,
    step,
    className = '',
    inputClassName = '',
}) => {
    const baseInputClasses = `
    block w-full rounded-lg border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${inputClassName}
  `;

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        rows={rows}
                        className={baseInputClasses}
                    />
                );

            case 'select':
                return (
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        required={required}
                        disabled={disabled}
                        className={baseInputClasses}
                    >
                        <option value="">Select {label}</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <input
                            id={name}
                            name={name}
                            type="checkbox"
                            checked={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            disabled={disabled}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    </div>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {options.map((option) => (
                            <div key={option.value} className="flex items-center">
                                <input
                                    id={`${name}-${option.value}`}
                                    name={name}
                                    type="radio"
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    disabled={disabled}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label
                                    htmlFor={`${name}-${option.value}`}
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'file':
                return (
                    <input
                        id={name}
                        name={name}
                        type="file"
                        onChange={onChange}
                        onBlur={onBlur}
                        accept={accept}
                        required={required}
                        disabled={disabled}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                );

            default:
                return (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        min={min}
                        max={max}
                        step={step}
                        className={baseInputClasses}
                    />
                );
        }
    };

    if (type === 'checkbox') {
        return (
            <div className={className}>
                {renderInput()}
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {label && type !== 'checkbox' && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {renderInput()}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

FormField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'date', 'time', 'datetime-local', 'tel', 'url', 'textarea', 'select', 'checkbox', 'radio', 'file']),
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    helperText: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    rows: PropTypes.number,
    accept: PropTypes.string,
    min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
    inputClassName: PropTypes.string,
};

export default FormField;
