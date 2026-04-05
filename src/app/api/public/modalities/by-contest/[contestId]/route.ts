import { proxyToApi } from "@/lib/api/proxy";

type RouteContext = {
  params: Promise<{ contestId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { contestId } = await context.params;

  return proxyToApi(request, `/modalities/by-contest/${contestId}`, {
    method: "GET",
  });
}
