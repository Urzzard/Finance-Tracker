import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import { SidebarProvider } from "../../components/sidebar/sidebar-context";
import { Sidebar } from "../../components/sidebar/sidebar";
import { SidebarToggle } from "../../components/sidebar/sidebar-toggle";
import { MainContent } from "../../components/sidebar/main-content";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <SidebarToggle />
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </SidebarProvider>
  );
}
