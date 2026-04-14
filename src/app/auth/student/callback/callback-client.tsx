"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdApi = {
  initialize: (input: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      shape?: "rectangular" | "pill" | "circle" | "square";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      width?: number;
      logo_alignment?: "left" | "center";
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdApi;
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function StudentCallbackClient() {
  const params = useSearchParams();
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const hasAutoExchangedRef = useRef(false);

  const idTokenFromQuery = params.get("id_token")?.trim() ?? "";
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exchangeToken = useCallback(async (idToken: string) => {
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
  }, [router]);

  const initializeGoogleButton = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID en el frontend.");
      return;
    }

    const googleIdApi = window.google?.accounts?.id;

    if (!googleIdApi || !buttonContainerRef.current) {
      return;
    }

    buttonContainerRef.current.innerHTML = "";

    googleIdApi.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (credentialResponse) => {
        const credential = credentialResponse.credential?.trim() ?? "";

        if (!credential) {
          setError("Google no devolvio un id_token valido.");
          return;
        }

        void exchangeToken(credential);
      },
    });

    googleIdApi.renderButton(buttonContainerRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      width: 320,
    });
  }, [exchangeToken]);

  useEffect(() => {
    if (!idTokenFromQuery || hasAutoExchangedRef.current) {
      return;
    }

    hasAutoExchangedRef.current = true;
    void exchangeToken(idTokenFromQuery);
  }, [exchangeToken, idTokenFromQuery]);

  useEffect(() => {
    if (!scriptLoaded || idTokenFromQuery) {
      return;
    }

    initializeGoogleButton();
  }, [idTokenFromQuery, initializeGoogleButton, scriptLoaded]);

  function onScriptLoaded() {
    setScriptLoaded(true);
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={onScriptLoaded}
      />

      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <CardTitle>Acceso estudiante con Google</CardTitle>
          <CardDescription>
            Inicia sesión con tu cuenta institucional y crea una sesión RCMS.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {idTokenFromQuery ? (
            <p className="text-sm text-neutral-600">
              Se detectó un token OAuth en la URL. Validando sesión...
            </p>
          ) : (
            <div
              ref={buttonContainerRef}
              className="flex min-h-11 items-center justify-start"
            />
          )}

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace("/")}
            disabled={loading}
          >
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
