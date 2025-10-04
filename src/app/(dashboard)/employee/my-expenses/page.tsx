"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Filter } from "lucide-react";

interface Expense {
    id: string;
    category: string;
    amount: number;
    status: string;
    date: string;
    currency: string;
}

const MyExpenses = () => {
    const router = useRouter();
    const [expenses] = useState<Expense[]>([]); // Empty array for no data
    const [filters, setFilters] = useState({
      status: "all",
      category: "all",
      dateFrom: "",
      dateTo: "",
    });

    const handleSubmitFirstExpense = () => {
      router.push("/employee/submit-expense");
    };
  
    const handleFilterChange = (field: string, value: string) => {
      setFilters(prev => ({ ...prev, [field]: value }));
    };
  
    const filteredExpenses = expenses.filter(expense => {
      if (filters.status !== "all" && expense.status !== filters.status) return false;
      if (filters.category !== "all" && expense.category !== filters.category) return false;
      if (filters.dateFrom && expense.date < filters.dateFrom) return false;
      if (filters.dateTo && expense.date > filters.dateTo) return false;
      return true;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
                <p className="text-gray-600 mt-2">View and manage your submitted expenses</p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="status-filter">Status</Label>
                          <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All statuses</SelectItem>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="To Submit">To Submit</SelectItem>
                              <SelectItem value="Waiting Approval">Waiting Approval</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Submitted">Submitted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
            
                        <div>
                          <Label htmlFor="category-filter">Category</Label>
                          <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All categories</SelectItem>
                              <SelectItem value="Travel">Travel</SelectItem>
                              <SelectItem value="Meals">Meals</SelectItem>
                              <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                              <SelectItem value="Software">Software</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                            <Label htmlFor="date-from">Date From</Label>
                            <Input
                                id="date-from"
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="date-to">Date To</Label>
                            <Input
                                id="date-to"
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
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
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No expenses</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              You have not submitted any expenses yet.
                            </p>
                            <div className="mt-6">
                               <Button onClick={handleSubmitFirstExpense}>Submit Your First Expense</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Currency
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredExpenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {expense.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {expense.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expense.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        expense.status === 'Waiting Approval' ? 'bg-yellow-100 text-yellow-800' :
                                                            expense.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {expense.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(expense.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {expense.currency}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyExpenses;