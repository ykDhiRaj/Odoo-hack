"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/app/(dashboard)/admin/users/page";

interface UserManagementFormProps {
    users: User[];
    onSave: (userData: Partial<User>) => void;
    onCancel: () => void;
    initialData?: Partial<User>;
}

export const UserManagementForm = ({ users, onSave, onCancel, initialData }: UserManagementFormProps) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        role: initialData?.role || "Employee" as User["role"],
        assignedManager: initialData?.assignedManager || "",
        description: initialData?.description || "",
        isManagerApprover: initialData?.isManagerApprover || false,
        approvers: initialData?.approvers || [],
        approversSequence: initialData?.approversSequence || false,
        minimumApprovalPercentage: initialData?.minimumApprovalPercentage || 50,
    });

    const availableManagers = users.filter(user => user.role === "Manager" && user.isActive);
    const availableApprovers = users.filter(user => user.role !== "Admin" && user.isActive);

    const handleApproverToggle = (approverName: string) => {
        setFormData(prev => ({
            ...prev,
            approvers: prev.approvers.includes(approverName)
                ? prev.approvers.filter(name => name !== approverName)
                : [...prev.approvers, approverName]
        }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Card className="border-2">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Admin view (Approval rules)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* User Selection */}
                        <div>
                            <Label htmlFor="user">User</Label>
                            <Select
                                value={formData.name}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.filter(user => user.isActive).map((user) => (
                                        <SelectItem key={user.id} value={user.name}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description about rules</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter description about approval rules"
                                className="mt-1"
                            />
                        </div>

                        {/* Manager Selection */}
                        <div>
                            <Label htmlFor="manager">Manager</Label>
                            <Select
                                value={formData.assignedManager}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedManager: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableManagers.map((manager) => (
                                        <SelectItem key={manager.id} value={manager.name}>
                                            {manager.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                Dynamic dropdown<br />
                                Initially the manager set on user record should be set, admin can change manager for approval if required.
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Approvers Section */}
                        <div>
                            <Label className="text-base font-medium mb-3 block">Approvers</Label>
                            <div className="space-y-3">
                                {availableApprovers.map((approver) => (
                                    <div key={approver.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`approver-${approver.id}`}
                                            checked={formData.approvers.includes(approver.name)}
                                            onCheckedChange={() => handleApproverToggle(approver.name)}
                                        />
                                        <Label
                                            htmlFor={`approver-${approver.id}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {approver.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                If this field is checked, then by default the approve request would go to his/her manager first, before going to other approvers.
                            </p>
                        </div>

                        {/* Is Manager an Approver */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isManagerApprover"
                                checked={formData.isManagerApprover}
                                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isManagerApprover: checked }))}
                            />
                            <Label htmlFor="isManagerApprover" className="text-sm font-normal cursor-pointer">
                                Is manager an approver?
                            </Label>
                        </div>

                        {/* Approvers Sequence */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="approversSequence"
                                checked={formData.approversSequence}
                                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, approversSequence: checked }))}
                            />
                            <Label htmlFor="approversSequence" className="text-sm font-normal cursor-pointer">
                                Approvers Sequence
                            </Label>
                        </div>

                        <div className="text-xs text-gray-600">
                            <p>If this field is ticked as true then the above mentioned sequence of approvers matters, that is first the request goes to John, if he approves/rejects then only request goes to Mitchell and so on.</p>
                            <p>If the required approver does not approve/reject the request, then expense request is auto-rejected.</p>
                            <p>If not ticked then send approver request to all approvers at the same time.</p>
                        </div>

                        {/* Minimum Approval Percentage */}
                        <div>
                            <Label htmlFor="minApprovalPercentage">Minimum Approval percentage</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                <Input
                                    id="minApprovalPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.minimumApprovalPercentage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minimumApprovalPercentage: parseInt(e.target.value) || 0 }))}
                                    className="w-20"
                                />
                                <span className="text-sm text-gray-600">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Save User Rules
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};