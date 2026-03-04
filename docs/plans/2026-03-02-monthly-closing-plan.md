# Monthly Closing - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sistema de resúmenes mensuales con cierre manual que permite al usuario cerrar meses específicos, ver historial y recibir advertencias al registrar transacciones de meses anteriores.

**Architecture:** 
- Nueva tabla `monthly_summaries` en Drizzle schema
- Server actions para crear y obtener resúmenes
- Nueva sección "Historial" en el dashboard
- Banner/botón para cerrar mes cuando corresponda
- Warning en formulario de transacciones

**Tech Stack:** Next.js 16, Drizzle ORM, shadcn/ui (Dialog, Card, Badge)

---

## Tarea 1: Schema de Base de Datos

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Agregar tabla monthly_summaries**

```typescript
// Agregar después de accountGroupMembers

// Tabla de resúmenes mensuales
export const monthlySummaries = pgTable('monthly_summaries', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  totalIncome: integer('total_income').notNull().default(0),
  totalExpense: integer('total_expense').notNull().default(0),
  netSavings: integer('net_savings').notNull().default(0),
  balancesByAccount: jsonb('balances_by_account'), // { accountId: balance }
  balancesByGroup: jsonb('balances_by_group'), // { groupId: balance }
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Step 2: Agregar relación**

```typescript
export const monthlySummariesRelations = relations(monthlySummaries, ({ one }) => ({
  user: one(users, { // si existe, si no borrar
    fields: [monthlySummaries.userId],
    references: [users.id],
  }),
}));
```

**Step 3: Generar migración**

Run: `npx drizzle-kit generate`
Expected: Crea archivo de migración con la nueva tabla

**Step 4: Push a DB**

Run: `npx drizzle-kit push`
Expected: Tabla creada en PostgreSQL

---

## Tarea 2: Server Actions

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Agregar imports**

```typescript
import { monthlySummaries, accounts, accountGroups, accountGroupMembers } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
```

**Step 2: Agregar acción createMonthlySummary**

```typescript
export async function createMonthlySummary(year: number, month: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  // Verificar que no exista ya un cierre para ese mes
  const existing = await db.query.monthlySummaries.findFirst({
    where: and(
      eq(monthlySummaries.userId, user.id),
      eq(monthlySummaries.year, year),
      eq(monthlySummaries.month, month)
    ),
  });

  if (existing) {
    return { success: false, error: 'Este mes ya fue cerrado' };
  }

  // Calcular incomes y expenses del mes
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Obtener cuentas del usuario
  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, user.id),
  });

  // Obtener grupos del usuario
  const userGroups = await db.query.accountGroups.findMany({
    where: eq(accountGroups.userId, user.id),
    with: {
      members: {
        with: { account: true },
      },
    },
  });

  // Calcular totales del mes
  const result = await db.select({
    type: transactions.type,
    total: sql<number>`sum(${transactions.amount})`,
  })
  .from(transactions)
  .where(
    and(
      eq(transactions.userId, user.id),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  )
  .groupBy(transactions.type);

  const income = result.find(r => r.type === 'income')?.total || 0;
  const expense = result.find(r => r.type === 'expense')?.total || 0;

  // Calcular balances por cuenta al cierre
  const balancesByAccount: Record<number, number> = {};
  for (const account of userAccounts) {
    const accountTransactions = await db.select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, account.id),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(transactions.type);

    let balance = 0;
    for (const t of accountTransactions) {
      if (t.type === 'income' || t.type === 'transfer') {
        balance += t.total;
      } else {
        balance -= t.total;
      }
    }
    balancesByAccount[account.id] = balance;
  }

  // Calcular balances por grupo
  const balancesByGroup: Record<number, number> = {};
  for (const group of userGroups) {
    let groupBalance = 0;
    for (const member of group.members) {
      groupBalance += balancesByAccount[member.account.id] || 0;
    }
    balancesByGroup[group.id] = groupBalance;
  }

  try {
    await db.insert(monthlySummaries).values({
      userId: user.id,
      year,
      month,
      totalIncome: income,
      totalExpense: expense,
      netSavings: income - expense,
      balancesByAccount,
      balancesByGroup,
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error creating monthly summary:', error);
    return { success: false, error: 'Error al crear cierre mensual' };
  }
}
```

**Step 3: Agregar acción getMonthlySummaries**

```typescript
export async function getMonthlySummaries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return await db.query.monthlySummaries.findMany({
    where: eq(monthlySummaries.userId, user.id),
    orderBy: (monthlySummaries, { desc }) => [
      desc(monthlySummaries.year),
      desc(monthlySummaries.month),
    ],
  });
}
```

**Step 4: Agregar acción getMonthlySummary**

```typescript
export async function getMonthlySummary(year: number, month: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return await db.query.monthlySummaries.findFirst({
    where: and(
      eq(monthlySummaries.userId, user.id),
      eq(monthlySummaries.year, year),
      eq(monthlySummaries.year, year),
      eq(monthlySummaries.month, month)
    ),
  });
}
```

---

## Tarea 3: Componente MonthlyHistory

**Files:**
- Create: `src/components/monthly-history.tsx`

**Step 1: Crear componente**

```typescript
'use client';

import { getMonthlySummaries } from '@/app/actions';
import { useEffect, useState } from 'react';

interface MonthlySummary {
  id: number;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  createdAt: Date;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatCurrency = (amount: number) => {
  const absAmount = Math.abs(amount / 100);
  const sign = amount >= 0 ? '' : '-';
  return `${sign}S/ ${absAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
};

export function MonthlyHistory() {
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonthlySummaries().then(data => {
      setSummaries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Cargando...</div>;
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No hay cierres mensuales aún. Cierra tu primer mes cuando estés listo.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {summaries.map(summary => (
        <div
          key={summary.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-50">
              {monthNames[summary.month - 1]} {summary.year}
            </div>
            <div className="text-sm text-slate-500">
              {formatCurrency(summary.totalIncome)} ingresos • {formatCurrency(summary.totalExpense)} gastos
            </div>
          </div>
          <div className={`text-lg font-bold ${summary.netSavings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netSavings)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Tarea 4: Botón "Cerrar Mes" y Banner

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Agregar lógica para determinar si mostrar el banner**

```typescript
// En el componente Dashboard, agregar:
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const isEndOfMonth = now.getDate() >= 25; // Mostrar desde el día 25

// Obtener summaries para ver si el mes actual ya está cerrado
const currentSummary = userSummaries.find(
  s => s.year === currentYear && s.month === currentMonth
);
const canCloseMonth = isEndOfMonth && !currentSummary;
```

**Step 2: Agregar CollapsibleSection para Historial**

```typescript
import { MonthlyHistory } from '@/components/monthly-history';

// Agregar en el return del Dashboard:
<CollapsibleSection 
  title="Historial de Cierres" 
  sectionKey="history" 
  defaultExpanded={false}
  className="text-xs px-3 sm:text-sm sm:px-4"
>
  <MonthlyHistory />
</CollapsibleSection>
```

**Step 3: Agregar botón de cerrar mes**

```typescript
// Crear componente CloseMonthButton
'use client';

import { useState } from 'react';
import { createMonthlySummary } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface CloseMonthButtonProps {
  year: number;
  month: number;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function CloseMonthButton({ year, month }: CloseMonthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);

  async function handleClose() {
    setLoading(true);
    const result = await createMonthlySummary(year, month);
    if (result.success) {
      setClosed(true);
    }
    setLoading(false);
  }

  if (closed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600">
        <CheckCircle className="w-5 h-5" />
        <span>Mes cerrado</span>
      </div>
    );
  }

  return (
    <Button onClick={handleClose} disabled={loading} variant="outline">
      {loading ? 'Cerrando...' : `Cerrar ${monthNames[month - 1]}`}
    </Button>
  );
}
```

**Step 4: Agregar banner en el dashboard**

```typescript
// Agregar antes del balance general:
{canCloseMonth && (
  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-amber-800 dark:text-amber-200">
          Es momento de cerrar el mes
        </h3>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          ¿Listo para cerrar {monthNames[currentMonth - 1]}? Tus transacciones están a salvo.
        </p>
      </div>
      <CloseMonthButton year={currentYear} month={currentMonth} />
    </div>
  </div>
)}
```

---

## Tarea 5: Vista de Detalle del Mes

**Files:**
- Create: `src/components/monthly-detail-dialog.tsx`

**Step 1: Crear componente**

```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getMonthlySummary, getTransactions } from '@/app/actions';
import { useEffect, useState } from 'react';

interface MonthlyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function MonthlyDetailDialog({ open, onOpenChange, year, month }: MonthlyDetailDialogProps) {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        getMonthlySummary(year, month),
        getTransactions() // TODO: filtrar por mes
      ]).then(([sum, txns]) => {
        setSummary(sum);
        setTransactions(txns);
        setLoading(false);
      });
    }
  }, [open, year, month]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {monthNames[month - 1]} {year}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Totales */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-sm text-slate-500">Ingresos</div>
                <div className="text-xl font-bold text-emerald-600">
                  S/ {(summary.totalIncome / 100).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="text-sm text-slate-500">Gastos</div>
                <div className="text-xl font-bold text-red-600">
                  S/ {(summary.totalExpense / 100).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-slate-500">Ahorro</div>
                <div className="text-xl font-bold text-blue-600">
                  S/ {(summary.netSavings / 100).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            {/* Más detalle aquí... */}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No hay resumen para este mes
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Tarea 6: Warning Transacciones Meses Anteriores

**Files:**
- Modify: `src/components/create-transaction-dialog.tsx`

**Step 1: Agregar estado y lógica de warning**

```typescript
// Agregar en el componente:
const [dateWarning, setDateWarning] = useState<string | null>(null);

function handleDateChange(dateStr: string) {
  const selectedDate = new Date(dateStr);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  
  // Si es un mes anterior al actual
  if (
    selectedYear < currentYear || 
    (selectedYear === currentYear && selectedMonth < currentMonth)
  ) {
    setDateWarning(
      `Estás registrando una transacción de ${monthNames[selectedMonth]} ${selectedYear}. ¿Es correcto?`
    );
  } else {
    setDateWarning(null);
  }
}
```

**Step 2: Agregar UI del warning**

```typescript
// En el formulario, después del campo de fecha:
<input
  type="date"
  name="date"
  onChange={(e) => handleDateChange(e.target.value)}
  // ... rest of props
/>

{dateWarning && (
  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
    <div className="flex items-start gap-2">
      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
      <div>
        <p className="text-sm text-amber-800 dark:text-amber-200">{dateWarning}</p>
        <button
          type="button"
          className="text-xs text-amber-600 underline mt-1"
          onClick={() => setDateWarning(null)}
        >
          Sí, es correcto
        </button>
      </div>
    </div>
  </div>
)}
```

---

## Estado de Implementación: ✅ COMPLETADO

| Tarea | Estado |
|-------|--------|
| Tarea 1: Schema de Base de Datos | ✅ |
| Tarea 2: Server Actions | ✅ |
| Tarea 3: Componente MonthlyHistory | ✅ |
| Tarea 4: Botón "Cerrar Mes" y Banner | ✅ |
| Tarea 5: Vista de Detalle del Mes | ✅ |
| Tarea 6: Warning Transacciones Meses Anteriores | ✅ |

**Observaciones (pendiente mejorar):**
- UI responsive, redimensionamiento y espaciado en desktop y mobile
