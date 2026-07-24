"use client";

import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "brand" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
}

export default function Badge({
  children,
  variant = "brand",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const baseClasses = "inline-flex items-center font-bold rounded-full transition-colors";

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  const variantClasses = {
    brand: "bg-[rgba(240,106,17,0.12)] text-[#c84d00] dark:text-[var(--brand)] border border-[rgba(240,106,17,0.25)]",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    neutral: "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
