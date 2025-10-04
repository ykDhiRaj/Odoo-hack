import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { expenses } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = parseInt(params.id);

    const expense = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .limit(1);

    if (expense.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ expense: expense[0] });

  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = parseInt(params.id);
    const updateData = await request.json();

    const updatedExpense = await db
      .update(expenses)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, expenseId))
      .returning();

    if (updatedExpense.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Expense updated successfully',
      expense: updatedExpense[0],
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = parseInt(params.id);

    const deletedExpense = await db
      .delete(expenses)
      .where(eq(expenses.id, expenseId))
      .returning();

    if (deletedExpense.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Expense deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}