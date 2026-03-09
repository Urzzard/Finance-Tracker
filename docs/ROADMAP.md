# Finance Tracker - Roadmap

## Pending Features

### High Priority

#### 1. Account Groups ✅ COMPLETADO
Allows users to group accounts for better financial organization.

**Implementation Details:**
- Users create groups (e.g., "Real Money", "Investments", "Monthly Expenses")
- An account can belong to multiple groups
- Each group displays:
  - Current balance (sum of accounts)
  - Month's income
  - Month's expenses
  - Net for the period
- Users can mark groups/accounts to "include in total balance"
  - This allows excluding credit cards, third-party debts, etc.
  - Total balance shows only what user considers "real money"

**Use Cases:**
- "Real Money": Only savings accounts, CTS, cash (excluding credit cards)
- Distinguish available money vs committed money

---

#### 2. Monthly Closing / Historical Summaries ✅ COMPLETADO
Monthly summary system with manual closing by the user.

**Implementation Details:**

Table `monthly_summaries`:
| Field | Description |
|-------|-------------|
| userId | User |
| year | Year (e.g., 2026) |
| month | Month (1-12) |
| totalIncome | Total income for the month |
| totalExpense | Total expenses for the month |
| netSavings | Income - Expenses (monthly savings) |
| balancesByAccount | JSON with each account's balance at closing |
| balancesByGroup | JSON with each group's balance at closing |
| createdAt | Date when the closing was created |

**Flow:**
1. **Notification**: System shows banner when there are pending months
2. **Manual Closing**: User clicks "Close Month" when ready (always available for past months, for current month only after day 25)
3. **Generation**: Record is created with period totals
4. **Flexibility**: User can continue adding transactions for closed month (summary updates)
5. **Warning**: When registering a transaction from a past month, shows confirmation warning

**Visualization:**
- "History" view with all closed months + pending months
- Clicking on a month shows: summary + transaction list for that period
- Month-to-month comparison

**Why manual:**
- User might have forgotten to register expenses on time
- Gives user control over when to make the "cut"

**Observaciones (pendiente mejorar):**
- UI responsive, redimensionamiento y espaciado en desktop y mobile

---

### Medium Priority

3. **Charts and Monthly Reports**
   - Pie charts by category
   - Line chart of expenses by month
   - Savings trends

4. **Monthly Budgets by Category**
   - Spending limit per category
   - Alerts when approaching limit

5. **Savings Goals**
   - Monthly/annual savings target
   - Progress tracking

6. **Recurring Transactions**
   - Create transactions that repeat automatically
   - Example: rent, Netflix subscription, electricity bill

---

### Low Priority

7. **Data Export (CSV/PDF)**
   - Export transactions by period
   - Export monthly summaries

8. **Excessive Spending Alerts**
   - Notifications when spending > X% vs previous month
   - Unusual category alerts

---

## Design Notes

- **Currency**: Amounts are stored in cents (integer) to avoid float errors
- **Transfers**: Do not affect net balance, only move money between accounts
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Drizzle ORM
