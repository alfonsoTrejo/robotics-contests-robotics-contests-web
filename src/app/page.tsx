import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listContests } from "@/lib/api/contests";

export default async function Home() {
  const contests = await listContests().catch(() => []);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fafafa_0%,_#ffffff_42%,_#f5f5f5_100%)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="mb-10 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Universidad + Robotica
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-black md:text-5xl">
            Gestion y seguimiento de torneos de robotica en un solo flujo.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
            Explora concursos abiertos, revisa modalidades y consulta podios.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {contests.length === 0 && (
            <Card className="border-black/10 shadow-none">
              <CardContent className="py-8 text-sm text-neutral-600">
                No hay concursos disponibles por ahora.
              </CardContent>
            </Card>
          )}

          {contests.map((contest) => (
            <Card key={contest.id} className="border-black/10 shadow-none transition-colors hover:bg-neutral-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4 text-xl">
                  <span>{contest.title}</span>
                  <Badge variant={contest.status === "OPEN" ? "default" : "secondary"}>
                    {contest.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-700">
                <p>{contest.description}</p>
                <p>{new Date(contest.date).toLocaleString()}</p>
                <p>{contest.location}</p>
                <Link
                  href={`/contests/${contest.id}`}
                  className="inline-flex text-sm font-medium underline underline-offset-4"
                >
                  Ver detalle del concurso
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
