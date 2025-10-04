"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <div className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          "bg-gray-200 data-[checked=true]:bg-blue-600",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          className
        )}>
          <span className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            "data-[checked=true]:translate-x-6 data-[checked=false]:translate-x-1"
          )} />
        </div>
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch }