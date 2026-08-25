// "use client";

// import React, { useId } from "react";

// interface AnimatedCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: React.ReactNode;
// }

// export const Checkbox = React.forwardRef<HTMLInputElement, AnimatedCheckboxProps>(
//   ({ label, checked, onChange, disabled, className = "", id, ...props }, ref) => {
//     const generatedId = useId();
//     const inputId = id || generatedId;

//     return (
//       <label
//         htmlFor={inputId}
//         className={`group inline-flex items-center gap-3 cursor-pointer select-none font-sans text-sm ${
//           disabled ? "opacity-50 cursor-not-allowed" : ""
//         } ${className}`}
//       >
//         {/* Hidden Input */}
//         <input
//           ref={ref}
//           id={inputId}
//           type="checkbox"
//           checked={checked}
//           onChange={onChange}
//           disabled={disabled}
//           className="peer sr-only"
//           {...props}
//         />

//         {/* Custom Checkbox Box */}
//         <span
//           className="
//             relative flex items-center justify-center
//             w-[22px] h-[22px] min-w-[22px]
//             rounded-[7px]
//             bg-slate-900/40 backdrop-blur-md
//             border border-slate-700/60
//             overflow-hidden
//             transition-all duration-300 ease-out
            
//             /* Hover States */
//             group-hover:border-indigo-400/60 group-hover:scale-105
            
//             /* Checked States (Tailwind Peer System) */
//             peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-violet-600
//             peer-checked:border-transparent
//             peer-checked:shadow-[0_0_0_3px_rgba(99,102,241,0.2),0_4px_14px_rgba(99,102,241,0.4)]
//             peer-checked:scale-105

//             /* Focus-visible accessibility */
//             peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950
//           "
//         >
//           {/* Radial Glow Effect inside Box on Checked */}
//           <span
//             className="
//               absolute inset-0 
//               bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.5)_0%,transparent_70%)]
//               opacity-0 scale-0
//               transition-all duration-400 ease-out
//               peer-checked:opacity-100 peer-checked:scale-150
//             "
//           />

//           {/* SVG Check Mark with Dash Animation */}
//           <svg
//             className="
//               relative z-10 w-3.2 h-3.2 text-white
//               [stroke-dasharray:24] [stroke-dashoffset:24]
//               transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-75
//               peer-checked:[stroke-dashoffset:0]
//             "
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={3.5}
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <polyline points="20 6 9 17 4 12" />
//           </svg>
//         </span>

//         {/* Label Text */}
//         {label && (
//           <span
//             className="
//               text-slate-400 text-xs font-medium
//               transition-colors duration-250 ease-out
//               group-hover:text-slate-200
//               peer-checked:text-slate-100 peer-checked:font-semibold
//             "
//           >
//             {label}
//           </span>
//         )}
//       </label>
//     );
//   }
// );

// Checkbox.displayName = "Checkbox";

// export default Checkbox;

"use client";

import React, { useId } from "react";

interface AnimatedCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, AnimatedCheckboxProps>(
  ({ label, checked, onChange, disabled, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`inline-flex items-center gap-2 select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
        <div className="relative inline-flex items-center justify-center shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label htmlFor={inputId} className="check cursor-pointer relative block w-[18px] h-[18px] m-auto active:scale-95 transition-transform duration-150">
            <svg width="18px" height="18px" viewBox="0 0 18 18" className="relative z-10 fill-none stroke-linecap-round stroke-linejoin-round stroke-[#94a3b8] stroke-[1.5] transition-all duration-200 ease-out">
              <path 
                d="M 1 9 L 1 9 c 0 -5 3 -8 8 -8 L 9 1 C 14 1 17 5 17 9 L 17 9 c 0 4 -4 8 -8 8 L 9 17 C 5 17 1 14 1 9 L 1 9 Z" 
                className="[stroke-dasharray:60] [stroke-dashoffset:0] transition-all duration-300 ease-linear peer-checked:group-[.check]:[stroke-dashoffset:60]"
              />
              <polyline 
                points="1 9 7 14 15 4" 
                className="[stroke-dasharray:22] [stroke-dashoffset:66] transition-all duration-200 ease-linear peer-checked:group-[.check]:[stroke-dashoffset:42]"
              />
            </svg>
          </label>
        </div>

        {label && (
          <label htmlFor={inputId} className="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
            {label}
          </label>
        )}

        <style jsx global>{`
          .check svg {
            -webkit-tap-highlight-color: transparent;
            transform: translate3d(0, 0, 0);
          }
          
          .check:hover svg {
            stroke: #6366f1;
            filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.8));
          }

          input:checked + .check svg {
            stroke: #6366f1;
            filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.9)) drop-shadow(0 0 10px rgba(79, 70, 229, 0.6));
          }

          input:checked + .check svg path {
            stroke-dashoffset: 60;
            transition: all 0.3s linear;
          }

          input:checked + .check svg polyline {
            stroke-dashoffset: 42;
            transition: all 0.2s linear 0.15s;
          }
        `}</style>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;