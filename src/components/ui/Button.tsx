/**
 * Button Component
 * 
 * Reusable button with consistent styling across the application.
 * 
 * @module components/ui/Button
 */

'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    /** Size of the button */
    size?: 'sm' | 'md' | 'lg';
    /** Show loading spinner */
    isLoading?: boolean;
    /** Icon to show before text */
    leftIcon?: React.ReactNode;
    /** Icon to show after text */
    rightIcon?: React.ReactNode;
    /** Full width button */
    fullWidth?: boolean;
    /** Use dev mode colors (blue instead of orange) */
    isDevMode?: boolean;
}

const getVariantStyles = (isDevMode: boolean) => ({
    primary: isDevMode
        ? 'bg-dev-500 hover:bg-dev-600 text-white font-medium'
        : 'bg-accent-500 hover:bg-accent-600 text-white font-medium',
    secondary: 'bg-dark-3 hover:bg-dark-4 text-content-1 border border-dark-5',
    ghost: 'bg-transparent hover:bg-dark-3/50 text-content-2 hover:text-content-1',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300',
    outline: 'bg-transparent border border-dark-5 hover:border-dark-6 text-content-1',
});

const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-sm gap-2 rounded-lg',
    lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            isDevMode = false,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading;
        const variantStyles = getVariantStyles(isDevMode);

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={`
                    inline-flex items-center justify-center
                    transition-all duration-200 ease-smooth
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-1
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variantStyles[variant]}
                    ${sizeStyles[size]}
                    ${fullWidth ? 'w-full' : ''}
                    ${className}
                `.trim().replace(/\s+/g, ' ')}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
