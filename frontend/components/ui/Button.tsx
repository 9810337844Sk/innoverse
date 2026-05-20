"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "outline" | "teal" | "purple";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export default function Button({
  children, variant = "primary", size = "md", onClick,
  disabled, loading, className = "", type = "button", fullWidth,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide text-xs";

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #FF2D78, #FF6B9D)",
      color: "white",
      boxShadow: "0 4px 20px rgba(255,45,120,0.3)",
    },
    ghost: {
      background: "rgba(255,45,120,0.06)",
      color: "#FF2D78",
      border: "1px solid rgba(255,45,120,0.2)",
    },
    danger: {
      background: "rgba(239,68,68,0.08)",
      color: "#DC2626",
      border: "1px solid rgba(239,68,68,0.25)",
    },
    outline: {
      background: "transparent",
      color: "#FF2D78",
      border: "1.5px solid #FF2D78",
    },
    teal: {
      background: "linear-gradient(135deg, #0D9488, #14B8A6)",
      color: "white",
      boxShadow: "0 4px 20px rgba(13,148,136,0.3)",
    },
    purple: {
      background: "linear-gradient(135deg, #A855F7, #C084FC)",
      color: "white",
      boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
    },
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      style={variantStyles[variant]}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
