import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="relative my-2.5 w-full">
      <input
        id={id}
        placeholder=" "
        className={`peer w-full bg-transparent py-1.5 text-xs sm:text-sm text-white border-b border-gray-600 outline-none transition-colors duration-300 focus:border-transparent ${className}`}
        {...props}
      />
      
      {/* Floating Label ปรับขนาดให้กระชับ เหมาะกับการ์ดขนาดเล็ก */}
      <label
        htmlFor={id}
        className="absolute left-0 top-1.5 text-gray-400 text-xs tracking-wider pointer-events-none transition-all duration-300 ease-in-out peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-gray-300 peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-gray-300 uppercase font-semibold"
      >
        {label}
      </label>
      
      {/* Active Indicator Line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white scale-x-0 transition-transform duration-300 ease-in-out origin-center peer-focus:scale-x-100" />
    </div>
  );
};