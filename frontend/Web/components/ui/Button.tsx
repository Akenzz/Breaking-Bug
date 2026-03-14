"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "relative overflow-hidden bg-gradient-to-br from-sp-accent to-sp-accent/90 text-sp-accent-text hover:from-sp-accent-hover hover:to-sp-accent border border-sp-accent/80",
    secondary:
        "relative overflow-hidden bg-gradient-to-br from-sp-bg to-sp-bg/80 text-sp-text border border-sp-border hover:border-sp-highlight/60 group",
    ghost:
        "bg-transparent text-sp-text-secondary hover:text-sp-text border border-transparent hover:border-sp-highlight/30 hover:bg-sp-highlight/5",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`
          inline-flex items-center justify-center
          font-semibold tracking-tight
          rounded-xl
          sp-interactive
          cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sp-highlight/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sp-bg
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
