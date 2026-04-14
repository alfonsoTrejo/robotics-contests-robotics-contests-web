import { proxyToApi } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim();

  if (!email) {
    return Response.json(
      { ok: false, error: { message: "Email es requerido" } },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ email });

  return proxyToApi(request, `/teams/by-email?${params.toString()}`, {
    method: "GET",
  });
}
