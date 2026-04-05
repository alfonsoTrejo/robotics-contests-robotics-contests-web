import { proxyToApi } from "@/lib/api/proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();

  return proxyToApi(request, `/winners/${id}`, {
    method: "PATCH",
    body,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyToApi(request, `/winners/${id}`, {
    method: "DELETE",
  });
}
