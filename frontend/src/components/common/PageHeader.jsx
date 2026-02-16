import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * Page Header Component with breadcrumbs and actions
 */
const PageHeader = ({
    title,
    subtitle,
    breadcrumbs = [],
    actions,
    tabs,
    activeTab,
    onTabChange,
    className = '',
}) => {
    return (
        <div className={`bg-white border-b border-gray-200 ${className}`}>
            <div className="px-6 py-4">
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                    <nav className="flex mb-4" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            {breadcrumbs.map((crumb, index) => (
                                <li key={index} className="flex items-center">
                                    {index > 0 && (
                                        <svg
                                            className="flex-shrink-0 h-5 w-5 text-gray-400 mx-2"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                    {crumb.href ? (
                                        <Link
                                            to={crumb.href}
                                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-900">
                                            {crumb.label}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}

                {/* Title and Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-sm text-gray-500">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex items-center space-x-3">
                            {Array.isArray(actions) && actions.length > 0 && !React.isValidElement(actions[0]) ? (
                                actions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant={action.variant || 'primary'}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        className={action.className}
                                        size={action.size || 'sm'}
                                    >
                                        {action.icon && <span className="mr-2">{action.icon}</span>}
                                        {action.label}
                                    </Button>
                                ))
                            ) : (
                                actions
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                {tabs && tabs.length > 0 && (
                    <div className="mt-4 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange && onTabChange(tab.id)}
                                    className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                  `}
                                >
                                    {tab.icon && (
                                        <span className="mr-2">{tab.icon}</span>
                                    )}
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span
                                            className={`
                        ml-2 py-0.5 px-2 rounded-full text-xs
                        ${activeTab === tab.id
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-600'
                                                }
                      `}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    breadcrumbs: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            href: PropTypes.string,
        })
    ),
    actions: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string.isRequired,
            variant: PropTypes.string,
            onClick: PropTypes.func,
        }))
    ]),
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.node,
            count: PropTypes.number,
        })
    ),
    activeTab: PropTypes.string,
    onTabChange: PropTypes.func,
    className: PropTypes.string,
};

export default PageHeader;
