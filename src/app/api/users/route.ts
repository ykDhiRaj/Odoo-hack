import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { users, companies } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const role = searchParams.get('role');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    let query = db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        managerId: users.managerId,
        isManagerApprover: users.isManagerApprover,
        isActive: users.isActive,
        createdAt: users.createdAt,
        company: {
          id: companies.id,
          name: companies.name,
          country: companies.country,
          currency: companies.currency,
        },
      })
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .where(eq(users.companyId, parseInt(companyId)));

    if (role) {
      query = query.where(and(
        eq(users.companyId, parseInt(companyId)),
        eq(users.role, role as 'admin' | 'manager' | 'employee')
      ));
    }

    const result = await query;

    return NextResponse.json({ users: result });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parseInt(userId)))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        managerId: users.managerId,
        isManagerApprover: users.isManagerApprover,
        isActive: users.isActive,
      });

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser[0],
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}