import { proxyToApi } from "@/lib/api/proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToApi(request, `/contests/${id}`, { method: "GET" });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();

  return proxyToApi(request, `/contests/${id}`, {
    method: "PATCH",
    body,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToApi(request, `/contests/${id}`, { method: "DELETE" });
}
