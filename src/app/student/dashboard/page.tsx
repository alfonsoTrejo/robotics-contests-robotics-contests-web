import { cookies } from "next/headers";

import { LogoutButton } from "@/components/layout/logout-button";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listMyTeams } from "@/lib/api/teams";
import { AUTH_ROLE_COOKIE_NAME } from "@/lib/constants";

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value;

  let teamsCount = 0;
  try {
    const teams = await listMyTeams();
    teamsCount = teams.length;
  } catch {
    teamsCount = 0;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader role="STUDENT" />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Cuenta</p>
            <h1 className="text-2xl font-semibold">Dashboard Estudiante</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <span>{role ?? "STUDENT"}</span>
            <LogoutButton />
          </div>
        </div>

        <Card className="border-black/10 shadow-none">
          <CardHeader>
            <CardTitle>Mis equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-700">
              Tienes {teamsCount} equipo(s) asociados a tu usuario.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
