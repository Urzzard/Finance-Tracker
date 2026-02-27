import { pgTable, serial, text, integer, timestamp, uuid, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. ENUMS: Para mantener la data limpia
// Define tipos de transacción fijos. 'transfer' es clave para mover plata de BCP a Efectivo sin duplicar gastos.
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense', 'transfer']);

// 2. TABLA: ACCOUNTS (Cuentas)
// Aquí guardas: "BCP Ahorros", "Efectivo", "Plin", "Tarjeta de Crédito"
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  currency: text('currency').default('PEN').notNull(),
  isCredit: boolean('is_credit').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  sortOrder: integer('sort_order'), 
});

// 3. TABLA: CATEGORIES (Categorías)
// Aquí guardas: "Sueldo", "Freelance", "Grati", "Alquiler", "Comida"
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  type: transactionTypeEnum('type').notNull(), // ¿Esta categoría es de ingreso o gasto?
  icon: text('icon'), // Guardamos un string para el emoji o icono luego
});

// 4. TABLA: TRANSACTIONS (El corazón)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  
  accountId: integer('account_id').references(() => accounts.id).notNull(), // ¿De qué cuenta salió/entró?
  categoryId: integer('category_id').references(() => categories.id), // ¿Qué es? (Puede ser null si es una transferencia)
  
  amount: integer('amount').notNull(), // Guardado en CENTAVOS (S/100.00 = 10000)
  description: text('description'), // "Almuerzo con cliente", "Pago de facturas"
  date: timestamp('date').notNull(), // Fecha real del gasto
  
  type: transactionTypeEnum('type').notNull(), // income, expense, transfer
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. TABLA: ACCOUNT GROUPS (Grupos de cuentas)
export const accountGroups = pgTable('account_groups', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  includeInTotal: boolean('include_in_total').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. TABLA: ACCOUNT GROUP MEMBERS (Tabla pivote many-to-many)
export const accountGroupMembers = pgTable('account_group_members', {
  groupId: integer('group_id').references(() => accountGroups.id, { onDelete: 'cascade' }).notNull(),
  accountId: integer('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
});

// 5. RELACIONES (Para que Drizzle sepa cómo unir las tablas en las consultas)
export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
  groupMembers: many(accountGroupMembers),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

// 7. RELACIONES para Grupos
export const accountGroupsRelations = relations(accountGroups, ({ many }) => ({
  members: many(accountGroupMembers),
}));

export const accountGroupMembersRelations = relations(accountGroupMembers, ({ one }) => ({
  group: one(accountGroups, {
    fields: [accountGroupMembers.groupId],
    references: [accountGroups.id],
  }),
  account: one(accounts, {
    fields: [accountGroupMembers.accountId],
    references: [accounts.id],
  }),
}));