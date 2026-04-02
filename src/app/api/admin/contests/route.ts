import { proxyToApi } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return proxyToApi(request, "/contests", { method: "GET" });
}

export async function POST(request: Request) {
  const body = await request.text();

  return proxyToApi(request, "/contests", {
    method: "POST",
    body,
  });
}
