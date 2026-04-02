"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function StudentCallbackClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [idToken, setIdToken] = useState(params.get("id_token") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTokenInQuery = useMemo(() => Boolean(params.get("id_token")), [params]);

  async function onExchangeToken() {
    if (!idToken) {
      setError("Falta id_token para iniciar sesion");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/google/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "No se pudo validar Google login");
      }

      router.replace("/student/dashboard");
      router.refresh();
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Error inesperado en callback";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-black/10 shadow-none">
      <CardHeader>
        <CardTitle>Callback de acceso estudiante</CardTitle>
        <CardDescription>
          Este endpoint recibe el id_token de Google y lo intercambia por la
          sesion del RCMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={idToken}
          onChange={(event) => setIdToken(event.target.value)}
          placeholder="id_token de Google"
        />

        {!hasTokenInQuery && (
          <p className="text-sm text-neutral-600">
            Si configuraste redirect OAuth, puedes enviar el token como query:
            <code className="ml-1 rounded bg-neutral-100 px-2 py-1">
              /auth/student/callback?id_token=...
            </code>
          </p>
        )}

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button onClick={onExchangeToken} disabled={loading}>
          {loading ? "Validando token..." : "Entrar como estudiante"}
        </Button>
      </CardContent>
    </Card>
  );
}
