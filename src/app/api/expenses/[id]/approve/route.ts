import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { expenses, expenseApprovals } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Approve or reject expense
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = parseInt(params.id);
    const { approverId, action, comments } = await request.json();

    if (!approverId || !action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid approval data' },
        { status: 400 }
      );
    }

    // Create approval record
    await db
      .insert(expenseApprovals)
      .values({
        expenseId,
        approverId: parseInt(approverId),
        stepOrder: 1, // Simplified for now
        action: action as 'approved' | 'rejected',
        comments,
        actionedAt: new Date(),
      });

    // Update expense status
    const updatedExpense = await db
      .update(expenses)
      .set({
        status: action as 'approved' | 'rejected',
        finalizedAt: new Date(),
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
      message: `Expense ${action} successfully`,
      expense: updatedExpense[0],
    });

  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}