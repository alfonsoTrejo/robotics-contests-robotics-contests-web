import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { StudentCallbackClient } from "./callback-client";

export default function StudentCallbackPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f5f5f5,_#ffffff_55%)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-14 md:px-8">
        <Suspense fallback={<p className="text-sm text-neutral-600">Cargando callback...</p>}>
          <StudentCallbackClient />
        </Suspense>
      </main>
    </div>
  );
}
