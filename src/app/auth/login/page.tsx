import { AdminLoginForm } from "@/components/features/auth/admin-login-form";
import { SiteHeader } from "@/components/layout/site-header";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f3f4f6,_#ffffff_50%)]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-16 md:px-8">
        <div className="grid w-full gap-10 md:grid-cols-2">
          <section className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Robotics Contest Management
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
              Panel administrativo del RCMS
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-neutral-600">
              Gestiona concursos, modalidades y ganadores desde un solo lugar.
              El registro inicial del admin se realiza fuera del frontend.
            </p>
          </section>

          <section className="max-w-md">
            <AdminLoginForm />
          </section>
        </div>
      </main>
    </div>
  );
}
