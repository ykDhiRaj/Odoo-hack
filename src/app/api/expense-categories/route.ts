import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { expenseCategories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch expense categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(expenseCategories)
      .where(and(
        eq(expenseCategories.companyId, parseInt(companyId)),
        eq(expenseCategories.isActive, true)
      ));

    return NextResponse.json({ categories: result });

  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new expense category
export async function POST(request: NextRequest) {
  try {
    const { companyId, name, description } = await request.json();

    if (!companyId || !name) {
      return NextResponse.json(
        { error: 'Company ID and name are required' },
        { status: 400 }
      );
    }

    const newCategory = await db
      .insert(expenseCategories)
      .values({
        companyId: parseInt(companyId),
        name,
        description,
      })
      .returning();

    return NextResponse.json({
      message: 'Expense category created successfully',
      category: newCategory[0],
    });

  } catch (error) {
    console.error('Error creating expense category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}