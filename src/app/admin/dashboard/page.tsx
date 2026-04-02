import { cookies } from "next/headers";
import Link from "next/link";

import { LogoutButton } from "@/components/layout/logout-button";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTH_ROLE_COOKIE_NAME } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value;

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader role="ADMIN" />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Panel</p>
            <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{role ?? "ADMIN"}</Badge>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-black/10 shadow-none">
            <CardHeader>
              <CardTitle>Concursos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-neutral-600">
                Crea, actualiza y cierra concursos.
              </p>
              <Link
                href="/admin/contests"
                className="inline-flex h-8 items-center justify-center rounded-md border border-black/20 px-3 text-sm font-medium hover:bg-neutral-100"
              >
                Abrir modulo
              </Link>
            </CardContent>
          </Card>

          <Card className="border-black/10 shadow-none">
            <CardHeader>
              <CardTitle>Modalidades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                La gestión por concurso se implementa en la siguiente fase.
              </p>
            </CardContent>
          </Card>

          <Card className="border-black/10 shadow-none">
            <CardHeader>
              <CardTitle>Ganadores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Asignación y edición de podio en próxima iteración.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
