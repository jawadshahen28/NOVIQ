import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'gold' | 'outline' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  gold:
    'border-noviq-gold bg-noviq-gold text-noviq-black hover:border-noviq-goldHover hover:bg-noviq-goldHover',
  outline:
    'border-noviq-border bg-transparent text-noviq-text hover:border-noviq-gold hover:text-noviq-gold',
  ghost:
    'border-transparent bg-transparent text-noviq-secondaryText hover:text-noviq-gold',
};

export default function Button({
  children,
  className = '',
  icon,
  variant = 'gold',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-noviq-border disabled:bg-noviq-border disabled:text-noviq-muted ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
