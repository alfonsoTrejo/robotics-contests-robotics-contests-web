import Link from "next/link";

type SiteHeaderProps = {
  role?: "ADMIN" | "STUDENT";
};

export function SiteHeader({ role }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em] text-black">
          RCMS
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {!role && (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-7 items-center justify-center rounded-md px-3 text-[0.8rem] font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Admin
              </Link>
              <Link
                href="/auth/student/callback"
                className="inline-flex h-7 items-center justify-center rounded-md bg-neutral-900 px-3 text-[0.8rem] font-medium text-white hover:bg-neutral-800"
              >
                Acceso estudiante
              </Link>
            </>
          )}
          {role === "ADMIN" && (
            <>
              <Link
                href="/admin/dashboard"
                className="inline-flex h-7 items-center justify-center rounded-md px-3 text-[0.8rem] font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/contests"
                className="inline-flex h-7 items-center justify-center rounded-md px-3 text-[0.8rem] font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Concursos
              </Link>
            </>
          )}
          {role === "STUDENT" && (
            <>
              <Link
                href="/student/dashboard"
                className="inline-flex h-7 items-center justify-center rounded-md px-3 text-[0.8rem] font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Mis equipos
              </Link>
              <Link
                href="/student/history"
                className="inline-flex h-7 items-center justify-center rounded-md px-3 text-[0.8rem] font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Historial
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
