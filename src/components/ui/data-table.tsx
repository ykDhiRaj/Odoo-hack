"use client";

import { ReactNode } from "react";

interface Column<T> {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], item: T) => ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    emptyMessage = "No data available",
    onRowClick,
    className = "",
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b">
                        {columns.map((column) => (
                            <th key={String(column.key)} className="text-left p-3 font-medium">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((column) => (
                                <td key={String(column.key)} className="p-3">
                                    {column.render
                                        ? column.render(item[column.key], item)
                                        : String(item[column.key] || "")
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}