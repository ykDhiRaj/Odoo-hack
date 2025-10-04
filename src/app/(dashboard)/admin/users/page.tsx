"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/users-table";
import { CreateUserModal } from "@/components/create-user-modal";
import { UserManagementForm } from "@/components/user-management-form";
import { EditRoleModal } from "@/components/edit-role-modal";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Manager" | "Employee";
    assignedManager: string;
    isActive: boolean;
    isManagerApprover?: boolean;
    approvers?: string[];
    approversSequence?: boolean;
    minimumApprovalPercentage?: number;
    description?: string;
}

const ManageUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
    const [selectedUserForManagement, setSelectedUserForManagement] = useState<User | null>(null);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [selectedUserForRoleEdit, setSelectedUserForRoleEdit] = useState<User | null>(null);

    const handleCreateUser = (userData: Omit<User, 'id' | 'isActive'>) => {
        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            isActive: true,
        };
        setUsers(prev => [...prev, newUser]);
        setIsCreateModalOpen(false);
        console.log('User created:', newUser);
    };

    const handleToggleUserStatus = (id: string) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === id
                    ? { ...user, isActive: !user.isActive }
                    : user
            )
        );
    };

    const handleManageUserRules = (user: User) => {
        setSelectedUserForManagement(user);
        setIsUserManagementOpen(true);
    };

    const handleSaveUserRules = (userData: Partial<User>) => {
        if (selectedUserForManagement) {
            setUsers(prev =>
                prev.map(user =>
                    user.id === selectedUserForManagement.id
                        ? { ...user, ...userData }
                        : user
                )
            );
        }
        setIsUserManagementOpen(false);
        setSelectedUserForManagement(null);
        console.log('User rules updated:', userData);
    };

    const handleCancelUserManagement = () => {
        setIsUserManagementOpen(false);
        setSelectedUserForManagement(null);
    };

    const handleEditUserRole = (user: User) => {
        setSelectedUserForRoleEdit(user);
        setIsEditRoleModalOpen(true);
    };

    const handleSaveUserRole = (userId: string, newRole: User["role"]) => {
        setUsers(prev =>
            prev.map(u =>
                u.id === userId
                    ? { ...u, role: newRole }
                    : u
            )
        );
        console.log('User role updated:', { userId, newRole });
    };

    const handleCloseEditRoleModal = () => {
        setIsEditRoleModalOpen(false);
        setSelectedUserForRoleEdit(null);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
                    <p className="text-gray-600 mt-2">Manage employees and managers</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Create New User
                </Button>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <UsersTable
                        users={users}
                        onToggleUserStatus={handleToggleUserStatus}
                        onManageUserRules={handleManageUserRules}
                        onEditUserRole={handleEditUserRole}
                    />
                </CardContent>
            </Card>

            {/* User Management Form */}
            {isUserManagementOpen && selectedUserForManagement && (
                <UserManagementForm
                    users={users}
                    onSave={handleSaveUserRules}
                    onCancel={handleCancelUserManagement}
                    initialData={selectedUserForManagement}
                />
            )}

            {/* Edit Role Modal */}
            {isEditRoleModalOpen && selectedUserForRoleEdit && (
                <EditRoleModal
                    user={selectedUserForRoleEdit}
                    isOpen={isEditRoleModalOpen}
                    onClose={handleCloseEditRoleModal}
                    onSave={handleSaveUserRole}
                />
            )}

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateUser={handleCreateUser}
            />
        </div>
    );
};

export default ManageUsersPage;