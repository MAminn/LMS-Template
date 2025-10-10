"use client";

import React, { createContext, useContext } from "react";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  value,
  onValueChange,
  className = "",
  children,
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className = "", children }: TabsListProps) {
  return (
    <div
      className={`
      inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500
      ${className}
    `}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({
  value,
  className = "",
  children,
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 
        text-sm font-medium ring-offset-white transition-all focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 
        disabled:pointer-events-none disabled:opacity-50
        ${
          isSelected
            ? "bg-white text-gray-950 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }
        ${className}
      `}
      onClick={() => onValueChange(value)}>
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({
  value,
  className = "",
  children,
}: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const { value: selectedValue } = context;

  if (selectedValue !== value) {
    return null;
  }

  return (
    <div
      className={`
      mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-blue-500 focus-visible:ring-offset-2
      ${className}
    `}>
      {children}
    </div>
  );
}
