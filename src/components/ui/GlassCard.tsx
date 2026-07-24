"use client";

import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "subtle" | "bordered" | "interactive";
  glow?: boolean;
  className?: string;
}

export default function GlassCard({
  children,
  variant = "default",
  glow = false,
  className = "",
  ...props
}: GlassCardProps) {
  const baseClasses = "rounded-2xl transition-all duration-300 backdrop-blur-xl";
  
  const variantClasses = {
    default: "bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(30,20,16,0.4)] border border-[rgba(240,106,17,0.15)] dark:border-[rgba(255,255,255,0.08)] shadow-lg dark:shadow-2xl",
    subtle: "bg-white/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06]",
    bordered: "bg-white/90 dark:bg-[#181824]/90 border border-orange-500/20 dark:border-white/10 shadow-xl",
    interactive: "bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(30,20,16,0.4)] border border-slate-200 dark:border-white/10 hover:border-[var(--brand)] dark:hover:border-[var(--brand)] hover:shadow-xl hover:-translate-y-0.5 cursor-pointer",
  };

  const glowClasses = glow ? "relative before:absolute before:-inset-0.5 before:bg-gradient-to-r before:from-[var(--brand)] before:to-orange-600 before:rounded-2xl before:blur-md before:opacity-25 before:-z-10" : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
