import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch companies
export async function GET() {
  try {
    const result = await db
      .select()
      .from(companies);

    return NextResponse.json({ companies: result });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new company
export async function POST(request: NextRequest) {
  try {
    const { name, country, currency } = await request.json();

    if (!name || !country || !currency) {
      return NextResponse.json(
        { error: 'Name, country, and currency are required' },
        { status: 400 }
      );
    }

    const newCompany = await db
      .insert(companies)
      .values({
        name,
        country,
        currency,
      })
      .returning();

    return NextResponse.json({
      message: 'Company created successfully',
      company: newCompany[0],
    });

  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}