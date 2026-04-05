import { proxyToApi } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const contestId = url.searchParams.get("contestId");
  const modalityId = url.searchParams.get("modalityId");

  const params = new URLSearchParams();
  if (contestId) {
    params.set("contestId", contestId);
  }
  if (modalityId) {
    params.set("modalityId", modalityId);
  }

  const query = params.toString();
  const path = query ? `/teams?${query}` : "/teams";

  return proxyToApi(request, path, { method: "GET" });
}
