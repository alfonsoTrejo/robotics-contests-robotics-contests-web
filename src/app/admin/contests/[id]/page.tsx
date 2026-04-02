import Link from "next/link";
import { notFound } from "next/navigation";

import { ContestEditForm } from "@/components/features/contests/contest-edit-form";
import { ModalityCreateForm } from "@/components/features/modalities/modality-create-form";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContestById } from "@/lib/api/contests";
import { listModalitiesByContest } from "@/lib/api/modalities";

type AdminContestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminContestDetailPage({
  params,
}: AdminContestDetailPageProps) {
  const { id } = await params;

  const contest = await getContestById(id, "no-store").catch(() => null);
  if (!contest) {
    notFound();
  }

  const modalities = await listModalitiesByContest(id, "no-store").catch(() => []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader role="ADMIN" />
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Gestion de concurso</h1>
          <Link href="/admin/contests" className="text-sm underline underline-offset-4">
            Volver
          </Link>
        </div>

        <ContestEditForm contest={contest} />

        <section className="grid gap-4 md:grid-cols-2">
          <ModalityCreateForm contestId={contest.id} />

          <Card className="border-black/10 shadow-none">
            <CardHeader>
              <CardTitle>Modalidades del concurso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-700">
              {modalities.length === 0 && <p>No hay modalidades registradas aun.</p>}
              {modalities.map((modality) => (
                <div key={modality.id} className="rounded-md border border-black/10 px-3 py-2">
                  <p className="font-medium">{modality.name}</p>
                  <p>{modality.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
