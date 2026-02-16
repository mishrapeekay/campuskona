import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
    children,
    title,
    subtitle,
    headerActions,
    footer,
    variant = 'default',
    padding = 'md',
    className = '',
}) => {
    // Base styles
    const baseStyles = 'bg-card text-card-foreground rounded-lg';

    // Variant styles
    const variantStyles = {
        default: 'border border-border',
        elevated: 'shadow-md shadow-black/5 dark:shadow-black/20',
        outlined: 'border-2 border-border',
    };

    // Padding styles
    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
    };

    // Combine styles
    const cardClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;

    return (
        <div className={cardClasses}>
            {/* Header via props */}
            {(title || headerActions) && (
                <div className={`flex items-center justify-between border-b border-border ${paddingStyles[padding]} pb-4`}>
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-foreground">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {headerActions && (
                        <div className="flex items-center space-x-2">
                            {headerActions}
                        </div>
                    )}
                </div>
            )}

            {/* Body */}
            <div className={(!title && !headerActions) ? '' : (title || headerActions ? paddingStyles[padding] : `${paddingStyles[padding]}`)}>
                {children}
            </div>

            {/* Footer via props */}
            {footer && (
                <div className={`border-t border-border ${paddingStyles[padding]} pt-4`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

// Sub-components
const Header = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-border ${className}`}>
        {children}
    </div>
);

const Body = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

const Footer = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-t border-border ${className}`}>
        {children}
    </div>
);

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

Card.propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    headerActions: PropTypes.node,
    footer: PropTypes.node,
    variant: PropTypes.oneOf(['default', 'elevated', 'outlined']),
    padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
    className: PropTypes.string,
};

export default Card;
