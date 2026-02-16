import React from 'react';
import PropTypes from 'prop-types';

/**
 * Statistics Card Component for Dashboards
 */
const StatsCard = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    color = 'blue',
    loading = false,
    onClick,
    className = '',
}) => {
    // Color styles
    const colorStyles = {
        blue: {
            bg: 'bg-blue-50/50 dark:bg-blue-500/10',
            icon: 'text-blue-600 dark:text-blue-400',
            trend: 'text-blue-600 dark:text-blue-400',
        },
        green: {
            bg: 'bg-green-50/50 dark:bg-green-500/10',
            icon: 'text-green-600 dark:text-green-400',
            trend: 'text-green-600 dark:text-green-400',
        },
        red: {
            bg: 'bg-red-50/50 dark:bg-red-500/10',
            icon: 'text-red-600 dark:text-red-400',
            trend: 'text-red-600 dark:text-red-400',
        },
        yellow: {
            bg: 'bg-yellow-50/50 dark:bg-yellow-500/10',
            icon: 'text-yellow-600 dark:text-yellow-400',
            trend: 'text-yellow-600 dark:text-yellow-400',
        },
        purple: {
            bg: 'bg-purple-50/50 dark:bg-purple-500/10',
            icon: 'text-purple-600 dark:text-purple-400',
            trend: 'text-purple-600 dark:text-purple-400',
        },
        amber: {
            bg: 'bg-amber-50/50 dark:bg-amber-500/10',
            icon: 'text-amber-600 dark:text-amber-400',
            trend: 'text-amber-600 dark:text-amber-400',
        },
        gray: {
            bg: 'bg-muted dark:bg-muted/20',
            icon: 'text-muted-foreground',
            trend: 'text-muted-foreground',
        },
    };

    const colors = colorStyles[color] || colorStyles.blue;

    // Trend icon
    const TrendIcon = ({ direction }) => {
        if (direction === 'up') {
            return (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            );
        }
        if (direction === 'down') {
            return (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            );
        }
        return null;
    };

    const cardClasses = `bg-card rounded-lg border border-border p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
        } ${className}`;

    if (loading) {
        return (
            <div className={cardClasses}>
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={cardClasses} onClick={onClick}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {value}
                    </p>

                    {/* Trend */}
                    {trend && trendValue && (
                        <div className="flex items-center mt-2">
                            <span
                                className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                                    }`}
                            >
                                <TrendIcon direction={trend} />
                                <span className="ml-1">{trendValue}</span>
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">vs last period</span>
                        </div>
                    )}
                </div>

                {/* Icon */}
                {icon && (
                    <div className={`flex-shrink-0 ${colors.bg} rounded-lg p-3`}>
                        <div className={`h-8 w-8 ${colors.icon}`}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

StatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node,
    trend: PropTypes.oneOf(['up', 'down', 'neutral']),
    trendValue: PropTypes.string,
    color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple', 'amber', 'gray']),
    loading: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

export default StatsCard;
