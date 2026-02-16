import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ExclamationTriangleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    ArrowRightIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../common';
import { fetchExceptions } from '../../api/core';

const SEVERITY_CONFIG = {
    critical: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-800',
        icon: ExclamationCircleIcon,
        iconColor: 'text-red-600',
    },
    high: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        badge: 'bg-orange-100 text-orange-800',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-orange-600',
    },
    medium: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-600',
    },
    low: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-700',
        icon: InformationCircleIcon,
        iconColor: 'text-gray-500',
    },
};

const CATEGORY_LABELS = {
    attendance_missing: 'Attendance Pending',
    fees_overdue: 'Fees Overdue',
    approval_requests_pending: 'Pending Approvals',
    compliance_deadlines: 'Compliance Deadlines',
};

const ExceptionsWidget = () => {
    const [exceptions, setExceptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);

    const loadExceptions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchExceptions();
            setExceptions(response.data);
        } catch (err) {
            setError('Failed to load exceptions');
            console.error('Error fetching exceptions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExceptions();
        // Auto-refresh every 5 minutes
        const interval = setInterval(loadExceptions, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !exceptions) {
        return (
            <Card title="Action Required" padding="md">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded" />
                    ))}
                </div>
            </Card>
        );
    }

    if (error && !exceptions) {
        return (
            <Card title="Action Required" padding="md">
                <div className="text-center py-4 text-gray-500">
                    <p>{error}</p>
                    <button
                        onClick={loadExceptions}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                        Retry
                    </button>
                </div>
            </Card>
        );
    }

    const { summary, categories } = exceptions || { summary: { total: 0 }, categories: {} };

    if (summary.total === 0) {
        return (
            <Card title="Action Required" padding="md">
                <div className="text-center py-6">
                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">All clear! No exceptions to address.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card
            title={
                <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                        Action Required
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {summary.total}
                        </span>
                    </span>
                    <button
                        onClick={loadExceptions}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Refresh"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            }
            padding="md"
        >
            {/* Severity Summary Bar */}
            <div className="flex gap-3 mb-4">
                {summary.critical > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        {summary.critical} Critical
                    </span>
                )}
                {summary.high > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                        {summary.high} High
                    </span>
                )}
                {summary.medium > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {summary.medium} Medium
                    </span>
                )}
                {summary.low > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {summary.low} Low
                    </span>
                )}
            </div>

            {/* Exception Categories */}
            <div className="space-y-3">
                {Object.entries(categories).map(([category, items]) => {
                    if (!Array.isArray(items) || items.length === 0) return null;

                    const isExpanded = expandedCategory === category;
                    const displayItems = isExpanded ? items : items.slice(0, 3);
                    const highestSeverity = items.reduce((highest, item) => {
                        const order = { critical: 0, high: 1, medium: 2, low: 3 };
                        const itemSev = (item.severity || 'low').toLowerCase();
                        return order[itemSev] < order[highest] ? itemSev : highest;
                    }, 'low');

                    const config = SEVERITY_CONFIG[highestSeverity] || SEVERITY_CONFIG.low;

                    return (
                        <div key={category} className={`rounded-lg border ${config.border} ${config.bg} p-3`}>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className={`text-sm font-semibold ${config.text}`}>
                                    {CATEGORY_LABELS[category] || category}
                                    <span className="ml-1.5 text-xs font-normal opacity-75">
                                        ({items.length})
                                    </span>
                                </h4>
                            </div>

                            <ul className="space-y-2">
                                {displayItems.map((item) => {
                                    const itemConfig = SEVERITY_CONFIG[(item.severity || 'low').toLowerCase()] || SEVERITY_CONFIG.low;
                                    const Icon = itemConfig.icon;

                                    return (
                                        <li key={item.id} className="flex items-start gap-2">
                                            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${itemConfig.iconColor}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {item.description}
                                                </p>
                                            </div>
                                            {item.action_url && (
                                                <Link
                                                    to={item.action_url}
                                                    className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                                                    title="Take action"
                                                >
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {items.length > 3 && (
                                <button
                                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {isExpanded ? 'Show less' : `Show ${items.length - 3} more`}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default ExceptionsWidget;
