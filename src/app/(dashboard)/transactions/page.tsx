import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "../../../db";
import { getTransactions, getCategories } from "../actions";
import { TransactionsView } from "../../../components/transactions/transactions-view";

const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

export default async function TransactionsPage() {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/login');
  }

  const userAccounts = await db.query.accounts.findMany({
    where: (accounts, { eq }) => eq(accounts.userId, user.id),
    orderBy: (accounts, { asc }) => [asc(accounts.sortOrder), asc(accounts.createdAt)],
  });

  const [userTransactions, userCategories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <TransactionsView
      transactions={userTransactions}
      accounts={userAccounts}
      categories={userCategories}
    />
  );
}
