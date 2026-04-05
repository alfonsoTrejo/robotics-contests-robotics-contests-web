import { StudentDashboardClient } from "@/components/features/student/student-dashboard-client";
import { LogoutButton } from "@/components/layout/logout-button";
import { SiteHeader } from "@/components/layout/site-header";

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader role="STUDENT" />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Cuenta</p>
            <h1 className="text-2xl font-semibold">Dashboard Estudiante</h1>
          </div>
          <LogoutButton />
        </div>

        <StudentDashboardClient />
      </main>
    </div>
  );
}
