"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/app/(dashboard)/admin/users/page";

interface UsersTableProps {
  users: User[];
  onToggleUserStatus: (id: string) => void;
  onManageUserRules?: (user: User) => void;
  onEditUserRole?: (user: User) => void;
}

export const UsersTable = ({ users, onToggleUserStatus, onManageUserRules, onEditUserRole }: UsersTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users created yet.</p>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      Admin: "bg-red-100 text-red-800",
      Manager: "bg-blue-100 text-blue-800",
      Employee: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${colors[role as keyof typeof colors]}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Role</th>
            <th className="text-left p-3 font-medium">Assigned Manager</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{getRoleBadge(user.role)}</td>
              <td className="p-3">{user.assignedManager || "Not assigned"}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  user.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditUserRole?.(user)}
                  >
                    Edit Role
                  </Button>
                  {onManageUserRules && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onManageUserRules(user)}
                    >
                      Manage Rules
                    </Button>
                  )}
                  <Button
                    variant={user.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => onToggleUserStatus(user.id)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};