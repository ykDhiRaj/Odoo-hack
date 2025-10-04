"use client";

import { ApprovalsTable } from "@/components/approvals-table";

const ApprovalsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve expense requests</p>
      </div>

      <ApprovalsTable />
    </div>
  );
};

export default ApprovalsPage;