"use client";

import { Button } from "@/components/ui/button";
import { Approval } from "@/components/approvals-table";

interface ApprovalRowProps {
  approval: Approval;
  onApprovalUpdate: (id: string, newStatus: "approved" | "rejected") => void;
}

export const ApprovalRow = ({ approval, onApprovalUpdate }: ApprovalRowProps) => {
  const handleApprove = () => {
    onApprovalUpdate(approval.id, "approved");
  };

  const handleReject = () => {
    onApprovalUpdate(approval.id, "rejected");
  };

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

  const isReadOnly = approval.status !== "pending";

  return (
    <tr className={`border-b hover:bg-gray-50 ${isReadOnly ? 'opacity-60' : ''}`}>
      <td className="p-3">{approval.subject}</td>
      <td className="p-3">{approval.owner}</td>
      <td className="p-3">{approval.category}</td>
      <td className="p-3">{getStatusBadge(approval.status)}</td>
      <td className="p-3">${approval.amount.toFixed(2)}</td>
      <td className="p-3">
        <div className="flex gap-2">
          {!isReadOnly && (
            <>
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Approve
              </Button>
              <Button
                onClick={handleReject}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                size="sm"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};