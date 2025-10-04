"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/app/(dashboard)/admin/users/page";

interface EditRoleModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string, newRole: User["role"]) => void;
}

export const EditRoleModal = ({ user, isOpen, onClose, onSave }: EditRoleModalProps) => {
    const [selectedRole, setSelectedRole] = useState<User["role"]>(user.role);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(user.id, selectedRole);
        onClose();
    };

    const handleCancel = () => {
        setSelectedRole(user.role); // Reset to original role
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle>Edit User Role</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium text-gray-700">
                            User: {user.name} ({user.email})
                        </Label>
                    </div>

                    <div>
                        <Label htmlFor="role">New Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={(value: User["role"]) => setSelectedRole(value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Employee">Employee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm text-gray-600">
                        <p><strong>Current Role:</strong>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                user.role === "Admin" ? "bg-red-100 text-red-800" :
                                user.role === "Manager" ? "bg-blue-100 text-blue-800" :
                                "bg-green-100 text-green-800"
                            }`}>
                                {user.role}
                            </span>
                        </p>
                        <p><strong>New Role:</strong>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                selectedRole === "Admin" ? "bg-red-100 text-red-800" :
                                selectedRole === "Manager" ? "bg-blue-100 text-blue-800" :
                                "bg-green-100 text-green-800"
                            }`}>
                                {selectedRole}
                            </span>
                        </p>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={selectedRole === user.role}
                        >
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};