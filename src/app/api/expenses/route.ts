import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { expenses, users, expenseCategories } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET - Fetch expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const companyId = searchParams.get('companyId');

    if (!userId || !role || !companyId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let expenseQuery;

    if (role === 'admin') {
      // Admin can see all expenses in their company
      expenseQuery = db
        .select({
          id: expenses.id,
          amount: expenses.amount,
          currency: expenses.currency,
          description: expenses.description,
          expenseDate: expenses.expenseDate,
          status: expenses.status,
          receiptUrl: expenses.receiptUrl,
          merchantName: expenses.merchantName,
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
        .where(eq(expenses.companyId, parseInt(companyId)))
        .orderBy(desc(expenses.submittedAt));
    } else if (role === 'employee') {
      // Employee can only see their own expenses
      expenseQuery = db
        .select({
          id: expenses.id,
          amount: expenses.amount,
          currency: expenses.currency,
          description: expenses.description,
          expenseDate: expenses.expenseDate,
          status: expenses.status,
          receiptUrl: expenses.receiptUrl,
          merchantName: expenses.merchantName,
          submittedAt: expenses.submittedAt,
          category: {
            id: expenseCategories.id,
            name: expenseCategories.name,
          },
        })
        .from(expenses)
        .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
        .where(and(
          eq(expenses.employeeId, parseInt(userId)),
          eq(expenses.companyId, parseInt(companyId))
        ))
        .orderBy(desc(expenses.submittedAt));
    } else {
      // Manager can see expenses from their subordinates
      expenseQuery = db
        .select({
          id: expenses.id,
          amount: expenses.amount,
          currency: expenses.currency,
          description: expenses.description,
          expenseDate: expenses.expenseDate,
          status: expenses.status,
          receiptUrl: expenses.receiptUrl,
          merchantName: expenses.merchantName,
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
          eq(users.managerId, parseInt(userId)),
          eq(expenses.companyId, parseInt(companyId))
        ))
        .orderBy(desc(expenses.submittedAt));
    }

    const result = await expenseQuery;

    return NextResponse.json({ expenses: result });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new expense
export async function POST(request: NextRequest) {
  try {
    const {
      employeeId,
      companyId,
      categoryId,
      amount,
      currency,
      description,
      expenseDate,
      receiptUrl,
      merchantName,
    } = await request.json();

    if (!employeeId || !companyId || !amount || !currency || !description || !expenseDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newExpense = await db
      .insert(expenses)
      .values({
        employeeId: parseInt(employeeId),
        companyId: parseInt(companyId),
        categoryId: categoryId ? parseInt(categoryId) : null,
        amount: amount.toString(),
        currency,
        description,
        expenseDate: new Date(expenseDate),
        receiptUrl,
        merchantName,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      message: 'Expense created successfully',
      expense: newExpense[0],
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}