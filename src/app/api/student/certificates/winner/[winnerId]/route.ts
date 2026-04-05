import { API_BASE_URL } from "@/lib/constants";

type RouteContext = {
  params: Promise<{ winnerId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { winnerId } = await context.params;
  const cookie = request.headers.get("cookie") ?? "";

  const upstream = await fetch(`${API_BASE_URL}/certificates/winner/${winnerId}`, {
    method: "GET",
    headers: {
      cookie,
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response(JSON.stringify({ ok: false, error: { message: "No autorizado" } }), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const buffer = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "application/pdf";
  const contentDisposition =
    upstream.headers.get("content-disposition") ??
    `attachment; filename=certificate_${winnerId}.pdf`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}
