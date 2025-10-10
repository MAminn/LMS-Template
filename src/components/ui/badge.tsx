import React from "react";

export interface BadgeProps {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({
  className = "",
  children,
  variant = "default",
}: BadgeProps) {
  const variants = {
    default: "bg-blue-600 text-white",
    secondary: "bg-gray-100 text-gray-900",
    destructive: "bg-red-600 text-white",
    outline: "border border-gray-300 bg-white text-gray-700",
  };

  return (
    <div
      className={`
      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
      ${variants[variant]} ${className}
    `}>
      {children}
    </div>
  );
}
