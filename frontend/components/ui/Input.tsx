"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
          style={{ color: "rgba(26,10,18,0.5)" }}>
          {label}
        </label>
      )}
      <div className="relative flex items-stretch">
        {icon && (
          <>
            {/* Icon zone — wider for breathing room */}
            <div
              className="absolute inset-y-0 left-0 w-14 flex items-center justify-center pointer-events-none z-10"
              style={{ color: "rgba(107,114,128,0.55)" }}
            >
              {icon}
            </div>
            {/* Vertical divider */}
            <div
              className="absolute left-14 top-1/2 -translate-y-1/2 w-px h-[20px] pointer-events-none z-10"
              style={{ background: "rgba(255,45,120,0.15)" }}
            />
          </>
        )}
        <input
          ref={ref}
          className={`input-field ${icon ? "!pl-[3.75rem]" : ""} ${error ? "!border-red-400 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
export default Input;
