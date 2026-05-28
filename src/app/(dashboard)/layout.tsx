import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden md:flex" />
      <div className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_44%)]" />
        <Header
          title="REMTX"
          userName={user?.nome}
          userRole={user?.role}
        />
        <main className="relative flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1500px] animate-in fade-in-50 duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
