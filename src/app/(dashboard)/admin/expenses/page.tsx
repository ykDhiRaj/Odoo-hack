"use client";

import { ExpensesTable } from "@/components/expenses-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export interface Expense {
    id: string;
    employee: string;
    category: string;
    amount: number;
    convertedAmount: number;
    status: "pending" | "approved" | "rejected";
    date: string;
    description: string;
}

const AllExpensesPage = () => {
    const [expenses] = useState<Expense[]>([]); // Start empty as required
    const [filters, setFilters] = useState({
        status: "all",
        category: "all",
        dateFrom: "",
        dateTo: "",
        search: "",
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewExpense = (id: string) => {
        console.log('View expense:', id);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">All Expenses</h1>
                <p className="text-gray-600 mt-2">View and manage all expense reports</p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="statusFilter">Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="categoryFilter">Category</Label>
                            <Select
                                value={filters.category}
                                onValueChange={(value) => handleFilterChange("category", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    <SelectItem value="travel">Travel</SelectItem>
                                    <SelectItem value="office">Office Supplies</SelectItem>
                                    <SelectItem value="meals">Meals</SelectItem>
                                    <SelectItem value="software">Software</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="dateFrom">From Date</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="dateTo">To Date</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search expenses..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <ExpensesTable
                        expenses={expenses}
                        onViewExpense={handleViewExpense}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AllExpensesPage;