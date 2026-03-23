import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

export default async function ChartsPage() {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-violet-500 rounded-full"></div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Gráficos</h1>
      </div>
    </div>
  );
}
