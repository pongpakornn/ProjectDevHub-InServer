import React from 'react';

export type ButtonVariant = 'primary' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  // ปรับให้ปุ่มกะทัดรัดขึ้น มนสวยงามขึ้น (rounded-xl) พร้อม hover effect แบบนุ่มนวล
  const baseStyles =
    'w-full py-2.5 px-5 rounded-xl font-semibold text-sm tracking-wider uppercase ' +
    'outline-none border-none cursor-pointer text-white transition-all duration-200 ease-in-out ' +
    'hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-50';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[#2eab55] hover:bg-[#28964a] shadow-[0_4px_12px_rgba(46,171,85,0.25)] hover:shadow-[0_6px_16px_rgba(46,171,85,0.4)]',
    danger:
      'bg-[#e03131] hover:bg-[#c92a2a] shadow-[0_4px_12px_rgba(224,49,49,0.25)] hover:shadow-[0_6px_16px_rgba(224,49,49,0.4)]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};