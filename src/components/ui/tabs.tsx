'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

// Eigener Context für Tabs ohne Radix UI
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a Tabs component");
  }
  return context;
};

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue);
      } else {
        setActiveTab(newValue);
      }
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider
      value={{ value: value || activeTab, onValueChange: handleValueChange }}
    >
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  className,
  children,
  value,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabs();

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeValue === value &&
          "bg-background text-foreground shadow-sm",
        className
      )}
      onClick={() => onValueChange(value)}
      data-state={activeValue === value ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  className,
  children,
  value,
  ...props
}: TabsContentProps) {
  const { value: activeValue } = useTabs();

  if (activeValue !== value) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      data-state={activeValue === value ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  );
} 