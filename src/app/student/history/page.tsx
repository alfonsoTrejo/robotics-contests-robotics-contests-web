import { StudentHistoryClient } from "@/components/features/student/student-history-client";
import { SiteHeader } from "@/components/layout/site-header";

export default function StudentHistoryPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader role="STUDENT" />
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 md:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Historial y certificados</h1>
        <StudentHistoryClient />
      </main>
    </div>
  );
}
