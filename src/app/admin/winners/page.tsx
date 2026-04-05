import { SiteHeader } from "@/components/layout/site-header";
import { AdminWinnersManager } from "@/components/features/winners/admin-winners-manager";

export default function AdminWinnersPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader role="ADMIN" />
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 md:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Gestion de ganadores</h1>
        <AdminWinnersManager />
      </main>
    </div>
  );
}
