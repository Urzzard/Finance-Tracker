import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getMonthlySummaries, getMonthsWithTransactions } from "../actions";
import { HistoryView } from "../../../components/history/history-view";

const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

export default async function HistoryPage() {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/login');
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isEndOfMonth = now.getDate() >= 25;

  const [userSummaries, monthsWithTransactions] = await Promise.all([
    getMonthlySummaries(),
    getMonthsWithTransactions(),
  ]);

  return (
    <HistoryView
      summaries={userSummaries}
      pendingMonths={monthsWithTransactions}
      canCloseNow={isEndOfMonth}
      currentYear={currentYear}
      currentMonth={currentMonth}
    />
  );
}
