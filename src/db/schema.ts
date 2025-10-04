import { pgTable, serial, varchar, text, timestamp, decimal, boolean, integer, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'employee']);
export const expenseStatusEnum = pgEnum('expense_status', ['pending', 'approved', 'rejected', 'in_progress']);
export const approvalActionEnum = pgEnum('approval_action', ['pending', 'approved', 'rejected']);
export const approvalRuleTypeEnum = pgEnum('approval_rule_type', ['percentage', 'specific_approver', 'hybrid']);

// Companies Table
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull().default('employee'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  managerId: integer('manager_id').references((): any => users.id),
  isManagerApprover: boolean('is_manager_approver').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Expense Categories Table
export const expenseCategories = pgTable('expense_categories', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Expenses Table
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  employeeId: integer('employee_id').references(() => users.id).notNull(),
  categoryId: integer('category_id').references(() => expenseCategories.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  amountInCompanyCurrency: decimal('amount_in_company_currency', { precision: 10, scale: 2 }),
  exchangeRate: decimal('exchange_rate', { precision: 10, scale: 6 }),
  description: text('description').notNull(),
  expenseDate: timestamp('expense_date').notNull(),
  receiptUrl: text('receipt_url'),
  ocrData: jsonb('ocr_data'), // Store OCR extracted data
  merchantName: varchar('merchant_name', { length: 255 }),
  status: expenseStatusEnum('status').default('pending').notNull(),
  currentApprovalStep: integer('current_approval_step').default(0),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  finalizedAt: timestamp('finalized_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Approval Rules Table
export const approvalRules = pgTable('approval_rules', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  ruleType: approvalRuleTypeEnum('rule_type').notNull(),
  minAmountThreshold: decimal('min_amount_threshold', { precision: 10, scale: 2 }),
  maxAmountThreshold: decimal('max_amount_threshold', { precision: 10, scale: 2 }),
  percentageRequired: integer('percentage_required'), // For percentage rule (e.g., 60)
  specificApproverId: integer('specific_approver_id').references(() => users.id), // For specific approver rule
  isHybrid: boolean('is_hybrid').default(false), // true if using OR logic
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Approval Steps Table (For multi-level sequential approvals)
export const approvalSteps = pgTable('approval_steps', {
  id: serial('id').primaryKey(),
  approvalRuleId: integer('approval_rule_id').references(() => approvalRules.id).notNull(),
  stepOrder: integer('step_order').notNull(), // 1, 2, 3 for Step 1, Step 2, Step 3
  approverId: integer('approver_id').references(() => users.id).notNull(),
  approverRole: varchar('approver_role', { length: 50 }), // e.g., 'Manager', 'Finance', 'Director'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Expense Approvals Table (Tracks approval history for each expense)
export const expenseApprovals = pgTable('expense_approvals', {
  id: serial('id').primaryKey(),
  expenseId: integer('expense_id').references(() => expenses.id).notNull(),
  approverId: integer('approver_id').references(() => users.id).notNull(),
  stepOrder: integer('step_order').notNull(),
  action: approvalActionEnum('action').default('pending').notNull(),
  comments: text('comments'),
  actionedAt: timestamp('actioned_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit Log Table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'expense', 'user', 'approval_rule'
  entityId: integer('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'create', 'update', 'approve', 'reject'
  changes: jsonb('changes'), // Store old and new values
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  expenses: many(expenses),
  approvalRules: many(approvalRules),
  expenseCategories: many(expenseCategories),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
  }),
  subordinates: many(users, { relationName: 'manager' }),
  expenses: many(expenses),
  approvals: many(expenseApprovals),
  approvalSteps: many(approvalSteps),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  company: one(companies, {
    fields: [expenseCategories.companyId],
    references: [companies.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  company: one(companies, {
    fields: [expenses.companyId],
    references: [companies.id],
  }),
  employee: one(users, {
    fields: [expenses.employeeId],
    references: [users.id],
  }),
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  approvals: many(expenseApprovals),
}));

export const approvalRulesRelations = relations(approvalRules, ({ one, many }) => ({
  company: one(companies, {
    fields: [approvalRules.companyId],
    references: [companies.id],
  }),
  specificApprover: one(users, {
    fields: [approvalRules.specificApproverId],
    references: [users.id],
  }),
  steps: many(approvalSteps),
}));

export const approvalStepsRelations = relations(approvalSteps, ({ one }) => ({
  approvalRule: one(approvalRules, {
    fields: [approvalSteps.approvalRuleId],
    references: [approvalRules.id],
  }),
  approver: one(users, {
    fields: [approvalSteps.approverId],
    references: [users.id],
  }),
}));

export const expenseApprovalsRelations = relations(expenseApprovals, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseApprovals.expenseId],
    references: [expenses.id],
  }),
  approver: one(users, {
    fields: [expenseApprovals.approverId],
    references: [users.id],
  }),
}));

const pgUrl = process.env.DATABASE_URL;
if (!pgUrl) {
  throw new Error("DATABASE_URL not configured in env");
}
const client = postgres(pgUrl, { prepare: false });
export const db = drizzle(client, {
  schema: {
    users,
    companies,
    expenseCategories,
    expenses,
  },
});