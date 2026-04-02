import { ProtectedRouteGuard } from "@/components/auth/protected-route-guard";

export const dynamic = "force-dynamic";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRouteGuard expectedRole="STUDENT">{children}</ProtectedRouteGuard>;
}
