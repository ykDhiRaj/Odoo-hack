"use client";

import { ApprovalRow } from "@/components/approval-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ExpenseData {
  id: number;
  amount: string;
  currency: string;
  description: string;
  expenseDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  submittedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

export interface Approval {
  id: string;
  subject: string;
  owner: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  amount: number;
  expenseDate: string;
  submittedAt: string;
  employeeId: number;
}

export const ApprovalsTable = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setError('User not found. Please login again.');
        return;
      }

      const response = await fetch(
        `/api/expenses?userId=${user.id}&role=${user.role}&companyId=${user.companyId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      
      // Filter only pending expenses and transform to Approval format
      const pendingExpenses = data.expenses
        .filter((expense: ExpenseData) => expense.status === 'pending')
        .map((expense: ExpenseData) => ({
          id: expense.id.toString(),
          subject: expense.description,
          owner: `${expense.employee.firstName} ${expense.employee.lastName}`,
          category: expense.category?.name || 'Uncategorized',
          status: expense.status as "pending" | "approved" | "rejected",
          amount: parseFloat(expense.amount),
          expenseDate: expense.expenseDate,
          submittedAt: expense.submittedAt,
          employeeId: expense.employee.id,
        }));

      setApprovals(pendingExpenses);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      setError('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalUpdate = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/api/expenses/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approverId: user.id,
          action: newStatus,
          comments: `${newStatus === 'approved' ? 'Approved' : 'Rejected'} by manager`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update approval');
      }

      // Update local state
      setApprovals(prev =>
        prev.map(approval =>
          approval.id === id
            ? { ...approval, status: newStatus }
            : approval
        )
      );

      // Optionally remove from pending list after approval/rejection
      setTimeout(() => {
        setApprovals(prev => prev.filter(approval => approval.id !== id));
      }, 1000);

    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Failed to update approval. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading approvals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Approvals ({approvals.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending approvals to review</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Approval Subject</th>
                  <th className="text-left p-3 font-medium">Request Owner</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <ApprovalRow
                    key={approval.id}
                    approval={approval}
                    onApprovalUpdate={handleApprovalUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};