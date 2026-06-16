import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "skill"
  | "weakness"
  | "available"
  | "busy"
  | "success"
  | "danger"
  | "draft"
  | "active"
  | "completed";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  skill: "bg-blue-50 text-blue-800 border border-blue-200",
  weakness: "bg-orange-50 text-orange-800 border border-orange-200",
  available: "bg-emerald-100 text-emerald-800",
  busy: "bg-amber-100 text-amber-800",
  success: "bg-green-50 text-green-800 border border-green-200",
  danger: "bg-red-50 text-red-800 border border-red-300 ring-1 ring-red-200",
  draft: "bg-slate-100 text-slate-700",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
