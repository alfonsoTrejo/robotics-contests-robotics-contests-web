import { AdminContestsManager } from "@/components/features/contests/admin-contests-manager";
import { SiteHeader } from "@/components/layout/site-header";
import { listContests } from "@/lib/api/contests";

export default async function AdminContestsPage() {
  const contests = await listContests("no-store").catch(() => []);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader role="ADMIN" />
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 md:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Concursos</h1>
        <AdminContestsManager initialContests={contests} />
      </main>
    </div>
  );
}
