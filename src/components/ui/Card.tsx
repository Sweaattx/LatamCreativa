/**
 * Card Component
 * 
 * Reusable card container with consistent styling.
 * 
 * @module components/ui/Card
 */

'use client';

import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Visual style variant */
    variant?: 'default' | 'elevated' | 'interactive' | 'ghost';
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Make the card clickable */
    asButton?: boolean;
}

const variantStyles = {
    default: 'bg-dark-2 border border-dark-5/50',
    elevated: 'bg-dark-2/80 border border-dark-5/50 shadow-lg',
    interactive: 'bg-dark-2/50 border border-dark-5/30 hover:bg-dark-2 hover:border-dark-5 cursor-pointer',
    ghost: 'bg-transparent',
};

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'default',
            padding = 'md',
            asButton = false,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                role={asButton ? 'button' : undefined}
                tabIndex={asButton ? 0 : undefined}
                className={`
                    rounded-xl
                    transition-all duration-200 ease-smooth
                    ${variantStyles[variant]}
                    ${paddingStyles[padding]}
                    ${asButton ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50' : ''}
                    ${className}
                `.trim().replace(/\s+/g, ' ')}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    )
);
CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={className} {...props}>
            {children}
        </div>
    )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`mt-4 pt-4 border-t border-dark-5/50 ${className}`} {...props}>
            {children}
        </div>
    )
);
CardFooter.displayName = 'CardFooter';

export default Card;
