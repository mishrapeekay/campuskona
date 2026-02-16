import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

/**
 * DataTable Component with sorting, pagination, and selection
 */
const DataTable = ({
    columns,
    data,
    loading = false,
    pagination,
    onPageChange,
    onSort,
    sortColumn,
    sortDirection,
    selectable = false,
    selectedRows = [],
    onSelectRow,
    onSelectAll,
    actions,
    emptyMessage = 'No data available',
    className = '',
}) => {
    const [hoveredRow, setHoveredRow] = useState(null);

    const handleSort = (column) => {
        if (!column.sortable) return;

        const newDirection =
            sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';

        onSort && onSort(column.key, newDirection);
    };

    const SortIcon = ({ column }) => {
        if (!column.sortable) return null;

        const isActive = sortColumn === column.key;

        return (
            <span className="ml-2 inline-flex flex-col">
                <svg
                    className={`h-3 w-3 ${isActive && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
                        }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M5 10l5-5 5 5H5z" />
                </svg>
                <svg
                    className={`h-3 w-3 -mt-1 ${isActive && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
                        }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M15 10l-5 5-5-5h10z" />
                </svg>
            </span>
        );
    };

    const renderCell = (row, column) => {
        if (column.render) {
            return column.render(row[column.key], row);
        }
        return row[column.key];
    };

    const isRowSelected = (row) => {
        return selectedRows.some((selected) => selected.id === row.id);
    };

    const allSelected = data.length > 0 && selectedRows.length === data.length;
    const someSelected = selectedRows.length > 0 && !allSelected;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
                <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {selectable && (
                                <th scope="col" className="w-12 px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(input) => {
                                            if (input) {
                                                input.indeterminate = someSelected;
                                            }
                                        }}
                                        onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </th>
                            )}

                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                                        }`}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center">
                                        {column.label}
                                        <SortIcon column={column} />
                                    </div>
                                </th>
                            ))}

                            {actions && (
                                <th scope="col" className="sticky right-0 z-10 bg-gray-50 border-l border-gray-200 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={`group ${hoveredRow === rowIndex ? 'bg-gray-50' : ''
                                    } ${isRowSelected(row) ? 'bg-blue-50' : ''
                                    } hover:bg-gray-50 transition-colors`}
                                onMouseEnter={() => setHoveredRow(rowIndex)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                {selectable && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={isRowSelected(row)}
                                            onChange={(e) => onSelectRow && onSelectRow(row, e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                )}

                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || 'text-gray-900'
                                            }`}
                                    >
                                        {renderCell(row, column)}
                                    </td>
                                ))}

                                {actions && (
                                    <td className={`sticky right-0 z-10 border-l border-gray-200 px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${isRowSelected(row) ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'}`}>
                                        {actions(row)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.previous}
                            onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.next}
                            onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>

                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">
                                    {(pagination.page - 1) * pagination.pageSize + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.page * pagination.pageSize, pagination.count)}
                                </span>{' '}
                                of <span className="font-medium">{pagination.count}</span> results
                            </p>
                        </div>

                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                                    disabled={!pagination.previous}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    Page {pagination.page} of {Math.ceil(pagination.count / pagination.pageSize)}
                                </span>

                                <button
                                    onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                                    disabled={!pagination.next}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

DataTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            sortable: PropTypes.bool,
            render: PropTypes.func,
            className: PropTypes.string,
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    pagination: PropTypes.shape({
        page: PropTypes.number.isRequired,
        pageSize: PropTypes.number.isRequired,
        count: PropTypes.number.isRequired,
        next: PropTypes.string,
        previous: PropTypes.string,
    }),
    onPageChange: PropTypes.func,
    onSort: PropTypes.func,
    sortColumn: PropTypes.string,
    sortDirection: PropTypes.oneOf(['asc', 'desc']),
    selectable: PropTypes.bool,
    selectedRows: PropTypes.array,
    onSelectRow: PropTypes.func,
    onSelectAll: PropTypes.func,
    actions: PropTypes.func,
    emptyMessage: PropTypes.string,
    className: PropTypes.string,
};

export default DataTable;
