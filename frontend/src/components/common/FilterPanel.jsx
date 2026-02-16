import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import FormField from './FormField';

/**
 * FilterPanel Component for dynamic filtering
 */
const FilterPanel = ({
    filters,
    values,
    onChange,
    onClear,
    onApply,
    showApplyButton = false,
    className = '',
}) => {
    const handleChange = (name, value) => {
        onChange && onChange({ ...values, [name]: value });
    };

    const handleClear = () => {
        const clearedValues = {};
        filters.forEach((filter) => {
            clearedValues[filter.name] = filter.type === 'checkbox' ? false : '';
        });
        onChange && onChange(clearedValues);
        onClear && onClear();
    };

    const hasActiveFilters = () => {
        return Object.values(values).some((value) => {
            if (typeof value === 'boolean') return value;
            return value !== '' && value !== null && value !== undefined;
        });
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                {hasActiveFilters() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                    >
                        Clear all
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filters.map((filter) => {
                    // Search input
                    if (filter.type === 'search') {
                        return (
                            <div key={filter.name} className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name={filter.name}
                                    value={values[filter.name] || ''}
                                    onChange={(e) => handleChange(filter.name, e.target.value)}
                                    placeholder={filter.placeholder || 'Search...'}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        );
                    }

                    // Date range
                    if (filter.type === 'daterange') {
                        return (
                            <div key={filter.name} className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {filter.label}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        name={`${filter.name}_from`}
                                        type="date"
                                        value={values[`${filter.name}_from`] || ''}
                                        onChange={(e) => handleChange(`${filter.name}_from`, e.target.value)}
                                        placeholder="From"
                                    />
                                    <FormField
                                        name={`${filter.name}_to`}
                                        type="date"
                                        value={values[`${filter.name}_to`] || ''}
                                        onChange={(e) => handleChange(`${filter.name}_to`, e.target.value)}
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        );
                    }

                    // Regular form field
                    return (
                        <FormField
                            key={filter.name}
                            label={filter.label}
                            name={filter.name}
                            type={filter.type}
                            value={values[filter.name] || (filter.type === 'checkbox' ? false : '')}
                            onChange={(e) => {
                                const value = filter.type === 'checkbox' ? e.target.checked : e.target.value;
                                handleChange(filter.name, value);
                            }}
                            placeholder={filter.placeholder}
                            options={filter.options}
                        />
                    );
                })}
            </div>

            {showApplyButton && (
                <div className="mt-4 flex justify-end">
                    <Button
                        variant="primary"
                        onClick={onApply}
                    >
                        Apply Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

FilterPanel.propTypes = {
    filters: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            label: PropTypes.string,
            type: PropTypes.oneOf(['text', 'search', 'select', 'date', 'daterange', 'checkbox', 'number']).isRequired,
            placeholder: PropTypes.string,
            options: PropTypes.arrayOf(
                PropTypes.shape({
                    value: PropTypes.any.isRequired,
                    label: PropTypes.string.isRequired,
                })
            ),
        })
    ).isRequired,
    values: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func,
    onApply: PropTypes.func,
    showApplyButton: PropTypes.bool,
    className: PropTypes.string,
};

export default FilterPanel;
