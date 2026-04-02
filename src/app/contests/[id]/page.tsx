import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContestById } from "@/lib/api/contests";
import { listModalitiesByContest } from "@/lib/api/modalities";
import { listWinnersByContest } from "@/lib/api/winners";

type ContestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { id } = await params;

  const contest = await getContestById(id).catch(() => null);
  if (!contest) {
    notFound();
  }

  const [modalities, winners] = await Promise.all([
    listModalitiesByContest(id).catch(() => []),
    listWinnersByContest(id).catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{contest.title}</h1>
          <p className="text-neutral-700">{contest.description}</p>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>{new Date(contest.date).toLocaleString()}</span>
            <span>•</span>
            <span>{contest.location}</span>
            <Badge variant={contest.status === "OPEN" ? "default" : "secondary"}>
              {contest.status}
            </Badge>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-black/10 shadow-none">
            <CardHeader>
              <CardTitle>Modalidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-700">
              {modalities.length === 0 && <p>Sin modalidades registradas.</p>}
              {modalities.map((modality) => (
                <p key={modality.id}>{modality.name}</p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-black/10 shadow-none">
            <CardHeader>
              <CardTitle>Podio del concurso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-700">
              {winners.length === 0 && <p>Aun no hay ganadores publicados.</p>}
              {winners.map((winner) => (
                <p key={winner.id}>
                  {winner.position} - Team {winner.teamId}
                </p>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
