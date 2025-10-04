"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { Loader2 } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface Expense {
    id: number;
    amount: string;
    currency: string;
    description: string;
    expenseDate: string;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
    category?: {
        id: number;
        name: string;
    };
}

interface DashboardStats {
    totalExpenses: number;
    pendingApprovals: number;
    approvedThisMonth: number;
}

const Dashboard = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalExpenses: 0,
        pendingApprovals: 0,
        approvedThisMonth: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.id) {
                setError('User not found. Please login again.');
                return;
            }

            const response = await fetch(
                `/api/expenses?userId=${user.id}&role=${user.role}&companyId=${user.companyId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }

            const data = await response.json();
            setExpenses(data.expenses);

            // Calculate stats
            const totalExpenses = data.expenses.reduce((sum: number, expense: Expense) => 
                sum + parseFloat(expense.amount), 0
            );

            const pendingApprovals = data.expenses.filter((expense: Expense) => 
                expense.status === 'pending'
            ).length;

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const approvedThisMonth = data.expenses.filter((expense: Expense) => {
                const expenseDate = new Date(expense.expenseDate);
                return expense.status === 'approved' && 
                       expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            }).length;

            setStats({
                totalExpenses,
                pendingApprovals,
                approvedThisMonth,
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Process data for charts
    const getMonthlyExpensesData = () => {
        const monthlyData = new Array(12).fill(0);
        const currentYear = new Date().getFullYear();

        expenses.forEach(expense => {
            const expenseDate = new Date(expense.expenseDate);
            if (expenseDate.getFullYear() === currentYear) {
                monthlyData[expenseDate.getMonth()] += parseFloat(expense.amount);
            }
        });

        return {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
                {
                    label: "Expenses",
                    data: monthlyData,
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                },
            ],
        };
    };

    const getCategoryExpensesData = () => {
        const categoryTotals: { [key: string]: number } = {};
        
        expenses.forEach(expense => {
            const categoryName = expense.category?.name || 'Uncategorized';
            categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + parseFloat(expense.amount);
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        return {
            labels,
            datasets: [
                {
                    label: "Expenses by Category",
                    data,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.8)",
                        "rgba(54, 162, 235, 0.8)",
                        "rgba(255, 205, 86, 0.8)",
                        "rgba(75, 192, 192, 0.8)",
                        "rgba(153, 102, 255, 0.8)",
                        "rgba(255, 159, 64, 0.8)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600 text-center">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of your expenses</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            ${stats.totalExpenses.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">
                            {stats.pendingApprovals}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Approved This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.approvedThisMonth}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Expenses by Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {expenses.length > 0 ? (
                            <Line data={getMonthlyExpensesData()} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500">No expenses data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {expenses.length > 0 ? (
                            <Doughnut data={getCategoryExpensesData()} options={pieOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500">No expenses data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;