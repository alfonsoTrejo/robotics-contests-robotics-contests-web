import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyHistory } from "@/lib/api/history";

export default async function StudentHistoryPage() {
  const history = await getMyHistory().catch(() => []);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader role="STUDENT" />
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 md:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Historial y certificados</h1>

        <div className="grid gap-4">
          {history.length === 0 && (
            <Card className="border-black/10 shadow-none">
              <CardContent className="py-6 text-sm text-neutral-600">
                Aun no hay equipos registrados en tu historial.
              </CardContent>
            </Card>
          )}

          {history.map((item) => (
            <Card key={item.id} className="border-black/10 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.winner ? <Badge>{item.winner.position}</Badge> : <Badge variant="secondary">Sin podio</Badge>}
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-700">
                <p>Concurso: {item.contest.title}</p>
                <p>Modalidad: {item.modality.name}</p>
                {item.winner && (
                  <Link
                    href={item.winner.certificateUrl}
                    className="inline-flex rounded-md border border-black/20 px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    Descargar certificado
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
