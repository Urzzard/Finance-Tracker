import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "../../../db";
import { getAccountBalances, getGroupsWithAccounts } from "../actions";
import { AccountsView } from "../../../components/accounts/accounts-view";

const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

export default async function AccountsPage() {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/login');
  }

  const userAccounts = await db.query.accounts.findMany({
    where: (accounts, { eq }) => eq(accounts.userId, user.id),
    orderBy: (accounts, { asc }) => [asc(accounts.sortOrder), asc(accounts.createdAt)],
  });

  const [accountBalances, userGroups] = await Promise.all([
    getAccountBalances(),
    getGroupsWithAccounts(),
  ]);

  return (
    <AccountsView
      accounts={userAccounts}
      groups={userGroups}
      accountBalances={accountBalances}
    />
  );
}
