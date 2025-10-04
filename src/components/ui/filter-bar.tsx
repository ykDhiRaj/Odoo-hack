"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  fields: FilterField[];
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  className?: string;
}

export function FilterBar({ fields, filters, onFilterChange, className = "" }: FilterBarProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.type === "text" && (
            <Input
              id={field.key}
              placeholder={field.placeholder}
              value={filters[field.key] || ""}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
            />
          )}
          {field.type === "select" && (
            <Select
              value={filters[field.key] || ""}
              onValueChange={(value) => onFilterChange(field.key, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`All ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {field.label.toLowerCase()}</SelectItem>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === "date" && (
            <Input
              id={field.key}
              type="date"
              value={filters[field.key] || ""}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}