"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamMembersCard } from "@/components/team-members-card";
import { Loader2, DollarSign, Clock, CheckCircle, Users } from "lucide-react";
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
  submittedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface DashboardStats {
  pendingApprovals: number;
  approvedThisMonth: number;
  totalTeamExpenses: number;
  teamMembersCount: number;
}

const ManagerDashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingApprovals: 0,
    approvedThisMonth: 0,
    totalTeamExpenses: 0,
    teamMembersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setError('User not found. Please login again.');
        return;
      }

      // Fetch manager dashboard data
      const response = await fetch(
        `/api/manager/dashboard?managerId=${user.id}&companyId=${user.companyId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch manager data');
      }

      const data = await response.json();
      
      setExpenses(data.teamExpenses);
      setTeamMembers(data.teamMembers);
      setStats(data.stats);

    } catch (err) {
      console.error('Error fetching manager data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          label: "Team Expenses",
          data: monthlyData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
      ],
    };
  };

  const getStatusDistributionData = () => {
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    expenses.forEach(expense => {
      if (expense.status in statusCounts) {
        statusCounts[expense.status as keyof typeof statusCounts]++;
      }
    });

    return {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          data: [statusCounts.pending, statusCounts.approved, statusCounts.rejected],
          backgroundColor: [
            'rgba(255, 193, 7, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)',
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
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of team expenses and approvals</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Expenses approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalTeamExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.teamMembersCount}</div>
            <p className="text-xs text-muted-foreground">
              Direct reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Expenses by Month</CardTitle>
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
            <CardTitle>Expense Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <Doughnut data={getStatusDistributionData()} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No expenses data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses and Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Team Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{expense.description}</h4>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {expense.employee.firstName} {expense.employee.lastName} • {expense.category?.name || 'Uncategorized'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${parseFloat(expense.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{expense.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent expenses</p>
              </div>
            )}
          </CardContent>
        </Card>

        <TeamMembersCard teamMembers={teamMembers} />
      </div>
    </div>
  );
};

export default ManagerDashboard;