"use client";

import { ApprovalRow } from "@/components/approval-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export interface Approval {
  id: string;
  subject: string;
  owner: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  amount: number;
}

export const ApprovalsTable = () => {
  // Start with empty array - no dummy data
  const [approvals, setApprovals] = useState<Approval[]>([]);

  const handleApprovalUpdate = (id: string, newStatus: "approved" | "rejected") => {
    setApprovals(prev =>
      prev.map(approval =>
        approval.id === id
          ? { ...approval, status: newStatus }
          : approval
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No approvals to review</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Approval Subject</th>
                  <th className="text-left p-3 font-medium">Request Owner</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Request Status</th>
                  <th className="text-left p-3 font-medium">Total Amount</th>
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