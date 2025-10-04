"use client";

import { Button } from "@/components/ui/button";
import { Expense } from "@/app/(dashboard)/admin/expenses/page";

interface ExpensesTableProps {
  expenses: Expense[];
  onViewExpense: (id: string) => void;
}

export const ExpensesTable = ({ expenses, onViewExpense }: ExpensesTableProps) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No expenses available.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Employee</th>
            <th className="text-left p-3 font-medium">Category</th>
            <th className="text-left p-3 font-medium">Amount (Local)</th>
            <th className="text-left p-3 font-medium">Converted Amount</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{expense.employee}</td>
              <td className="p-3">{expense.category}</td>
              <td className="p-3">${expense.amount.toFixed(2)}</td>
              <td className="p-3">${expense.convertedAmount.toFixed(2)}</td>
              <td className="p-3">{getStatusBadge(expense.status)}</td>
              <td className="p-3">{formatDate(expense.date)}</td>
              <td className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewExpense(expense.id)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};