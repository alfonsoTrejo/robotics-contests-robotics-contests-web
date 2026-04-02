"use client";

import { useEffect, useState } from "react";

type ProtectedRouteGuardProps = {
  expectedRole: "ADMIN" | "STUDENT";
  children: React.ReactNode;
};

type SessionUser = {
  id: string;
  role: "ADMIN" | "STUDENT";
  email: string;
};

export function ProtectedRouteGuard({
  expectedRole,
  children,
}: ProtectedRouteGuardProps) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          window.location.replace("/");
          return;
        }

        const payload = (await response.json()) as {
          ok?: boolean;
          data?: SessionUser;
        };

        if (!payload.ok || !payload.data || payload.data.role !== expectedRole) {
          window.location.replace("/");
          return;
        }

        if (!cancelled) {
          setAuthorized(true);
          setChecking(false);
        }
      } catch {
        window.location.replace("/");
      }
    }

    function onPageShow() {
      verifySession();
    }

    verifySession();
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [expectedRole]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-600">
        Verificando sesion...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
