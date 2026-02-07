# Finance Tracker - Agent Guidelines

This document provides essential information for agentic coding assistants working on this Next.js finance tracker application.

## Project Overview

- **Framework**: Next.js 16.1.5 with App Router
- **Language**: TypeScript with strict mode enabled
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Server Components + Client Components where needed

## Development Commands

### Core Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands
```bash
npx drizzle-kit generate   # Generate migrations
npx drizzle-kit push       # Push schema to database
npx drizzle-kit studio     # Open Drizzle Studio
```

### Testing
No test framework is currently configured. When adding tests, check package.json for available scripts or ask the user for preferred testing setup.

## Code Style Guidelines

### Import Organization
```typescript
// 1. React/Next.js imports first
import { redirect } from "next/navigation"
import { useState } from "react"

// 2. Third-party libraries
import { createClient } from "@supabase/supabase-js"
import { eq } from "drizzle-orm"

// 3. Internal imports (use @/* alias)
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { accounts } from "@/db/schema"
```

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to `./*`
- Use proper typing for all functions and components
- Prefer `interface` for object shapes, `type` for unions/primitives

### Component Patterns

#### Server Components (Default)
```typescript
// No 'use client' directive
export default async function Dashboard() {
  const supabase = await createClient()
  // Server-side logic, database queries
  return <div>{/* JSX */}</div>
}
```

#### Client Components
```typescript
'use client'

import { useState } from "react"

export function CreateAccountDialog() {
  const [open, setOpen] = useState(false)
  // Client-side interactivity
  return <div>{/* JSX */}</div>
}
```

#### Server Actions
```typescript
'use server'

import { revalidatePath } from "next/cache"
import { createClient } from "../utils/supabase/server"

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  // Server-side validation and database operations
  revalidatePath('/')
}
```

### Database Patterns

#### Schema Definition
```typescript
// src/db/schema.ts
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  // ... other fields
})
```

#### Database Queries
```typescript
// Use Drizzle ORM with proper typing
const userAccounts = await db.query.accounts.findMany({
  where: (accounts, { eq }) => eq(accounts.userId, user.id),
  orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
})
```

### Styling Guidelines

#### Tailwind CSS
- Use utility classes from design system
- Follow shadcn/ui component patterns
- Responsive design: `md:`, `lg:`, `xl:` prefixes
- Dark mode support with `dark:` prefix

#### Component Styling
```typescript
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className // Allow override via props
)}>
```

### Error Handling

#### Server Actions
```typescript
try {
  await db.insert(accounts).values(values)
  revalidatePath('/')
  return { success: true }
} catch (error) {
  console.error('Error creating account:', error)
  return { success: false, error: 'Failed to create account' }
}
```

#### Authentication
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  redirect('/login') // or return error
}
```

### Naming Conventions

#### Files
- Components: `PascalCase.tsx` (e.g., `CreateAccountDialog.tsx`)
- Server actions: `camelCase.ts` (e.g., `createAccount.ts`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`)
- Pages: `page.tsx`, `layout.tsx`

#### Variables/Functions
- Use `camelCase` for variables and functions
- Use `PascalCase` for React components
- Use `UPPER_SNAKE_CASE` for constants

#### Database
- Tables: `snake_case` (e.g., `user_accounts`)
- Columns: `camelCase` in code, `snake_case` in database
- Enums: `camelCase` (e.g., `transactionTypeEnum`)

### Security Best Practices

1. **Authentication**: Always verify user in server actions
2. **Database**: Use parameterized queries via Drizzle ORM
3. **Environment**: Never commit `.env.local` or secrets
4. **Validation**: Validate form data on server side

### File Structure

```
src/
├── app/                 # Next.js App Router
│   ├── actions.ts      # Server actions
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable components
│   └── ui/            # shadcn/ui components
├── db/                # Database configuration
│   ├── index.ts       # Database client
│   └── schema.ts      # Drizzle schema
└── utils/             # Utility functions
```

## Important Notes

- This is a Spanish-language application (comments and UI text in Spanish)
- Database stores amounts in cents (integers) to avoid floating point issues
- Uses Supabase for authentication and database hosting
- No test framework currently configured
- Follow existing patterns when adding new features

## Common Patterns

### Form Handling
```typescript
// Server Actions with FormData
export async function createAccount(formData: FormData) {
  const name = formData.get('name') as string
  const currency = formData.get('currency') as string || 'PEN'
  const isCredit = formData.get('isCredit') === 'on'
  // ... process data
}
```

### Modal/Dialog Components
```typescript
// Use shadcn/ui Dialog pattern
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Data Fetching
```typescript
// Server-side data fetching in page components
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const data = await db.query.table.findMany({
    where: (table, { eq }) => eq(table.userId, user.id)
  })
  return <Component data={data} />
}
```