"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApprovalRule {
    id: string;
    name: string;
    type: "percentage" | "specific_approver" | "hybrid";
    threshold?: number;
    specificApprover?: string;
    isActive: boolean;
}

const ApprovalRulesPage = () => {
    const [rules, setRules] = useState<ApprovalRule[]>([]);
    const [isCreatingRule, setIsCreatingRule] = useState(false);
    const [newRule, setNewRule] = useState({
        name: "",
        type: "percentage" as ApprovalRule["type"],
        threshold: 60,
        specificApprover: "",
    });

    const handleCreateRule = () => {
        if (newRule.name) {
            const rule: ApprovalRule = {
                id: Date.now().toString(),
                name: newRule.name,
                type: newRule.type,
                threshold: newRule.type === "percentage" ? newRule.threshold : undefined,
                specificApprover: newRule.type === "specific_approver" ? newRule.specificApprover : undefined,
                isActive: true,
            };

            setRules(prev => [...prev, rule]);
            setNewRule({
                name: "",
                type: "percentage",
                threshold: 60,
                specificApprover: "",
            });
            setIsCreatingRule(false);
            console.log('Rule created:', rule);
        }
    };

    const handleToggleRule = (id: string) => {
        setRules(prev =>
            prev.map(rule =>
                rule.id === id
                    ? { ...rule, isActive: !rule.isActive }
                    : rule
            )
        );
    };

    const handleSaveAllRules = () => {
        console.log('Saving all rules:', rules);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Approval Rules</h1>
                    <p className="text-gray-600 mt-2">Configure expense approval workflows</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsCreatingRule(true)}
                    >
                        Add Rule
                    </Button>
                    <Button
                        onClick={handleSaveAllRules}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Save Rules
                    </Button>
                </div>
            </div>

            {/* Current Rules */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    {rules.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No approval rules configured yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rules.map((rule) => (
                                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-medium">{rule.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-sm ${rule.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                                }`}>
                                                {rule.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {rule.type === "percentage" && `Requires approval for expenses over ${rule.threshold}%`}
                                            {rule.type === "specific_approver" && `Requires approval from ${rule.specificApprover || "specific approver"}`}
                                            {rule.type === "hybrid" && "Hybrid approval rule"}
                                        </p>
                                    </div>
                                    <Button
                                      variant={rule.isActive ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleToggleRule(rule.id)}
                                    >
                                      {rule.isActive ? "Active" : "Inactive"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rule Configuration Section */}
            {isCreatingRule && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Rule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="ruleName">Rule Name</Label>
                            <Input
                                id="ruleName"
                                value={newRule.name}
                                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter rule name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="ruleType">Rule Type</Label>
                            <Select
                                value={newRule.type}
                                onValueChange={(value: ApprovalRule["type"]) =>
                                    setNewRule(prev => ({ ...prev, type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage-based</SelectItem>
                                    <SelectItem value="specific_approver">Specific Approver</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newRule.type === "percentage" && (
                            <div>
                                <Label htmlFor="threshold">Threshold (%)</Label>
                                <Input
                                    id="threshold"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newRule.threshold}
                                    onChange={(e) => setNewRule(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                                />
                            </div>
                        )}

                        {newRule.type === "specific_approver" && (
                            <div>
                                <Label htmlFor="approver">Specific Approver</Label>
                                <Select
                                    value={newRule.specificApprover}
                                    onValueChange={(value) => setNewRule(prev => ({ ...prev, specificApprover: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select approver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CFO">CFO</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Department Head">Department Head</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={handleCreateRule} className="bg-blue-600 hover:bg-blue-700">
                                Create Rule
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreatingRule(false)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ApprovalRulesPage;