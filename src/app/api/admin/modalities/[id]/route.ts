import { proxyToApi } from "@/lib/api/proxy";

type ModalityByIdRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: ModalityByIdRouteProps) {
  const { id } = await params;
  const body = await request.text();

  return proxyToApi(request, `/modalities/${id}`, {
    method: "PATCH",
    body,
  });
}

export async function DELETE(request: Request, { params }: ModalityByIdRouteProps) {
  const { id } = await params;

  return proxyToApi(request, `/modalities/${id}`, {
    method: "DELETE",
  });
}