import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { expenses, users, expenseCategories } from '@/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

// GET - Fetch manager dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');
    const companyId = searchParams.get('companyId');

    if (!managerId || !companyId) {
      return NextResponse.json(
        { error: 'Manager ID and Company ID are required' },
        { status: 400 }
      );
    }

    // Get team members (subordinates)
    const teamMembers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(and(
        eq(users.managerId, parseInt(managerId)),
        eq(users.companyId, parseInt(companyId)),
        eq(users.isActive, true)
      ));

    // Get team expenses (from subordinates)
    const teamExpenses = await db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        currency: expenses.currency,
        description: expenses.description,
        expenseDate: expenses.expenseDate,
        status: expenses.status,
        submittedAt: expenses.submittedAt,
        employee: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
        },
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.employeeId, users.id))
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(
        eq(users.managerId, parseInt(managerId)),
        eq(expenses.companyId, parseInt(companyId))
      ))
      .orderBy(desc(expenses.submittedAt));

    // Calculate stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    const stats = {
      pendingApprovals: teamExpenses.filter(expense => expense.status === 'pending').length,
      approvedThisMonth: teamExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expense.status === 'approved' && 
               expenseDate >= startOfMonth;
      }).length,
      totalTeamExpenses: teamExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      ),
      teamMembersCount: teamMembers.length,
    };

    return NextResponse.json({
      teamMembers,
      teamExpenses,
      stats,
    });

  } catch (error) {
    console.error('Error fetching manager dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}