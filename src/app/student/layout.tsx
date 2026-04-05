import { redirect } from "next/navigation";

import { resolveSessionUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await resolveSessionUser();

  if (!session || session.role !== "STUDENT") {
    redirect("/");
  }

  return <>{children}</>;
}
