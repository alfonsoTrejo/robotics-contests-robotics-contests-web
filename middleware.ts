import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { ApiResponse } from "@/lib/types/api";
import { API_BASE_URL, AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME } from "@/lib/constants";

const adminPaths = ["/admin"];
const studentPaths = ["/student"];
const authPaths = ["/auth/login", "/auth/student/callback"];

function startsWithAny(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

type SessionPayload = {
  id: string;
  role: "ADMIN" | "STUDENT";
  email: string;
};

async function resolveSessionRole(request: NextRequest): Promise<"ADMIN" | "STUDENT" | null> {
  const cookie = request.headers.get("cookie") ?? "";

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<SessionPayload>;
    if (!payload.ok) {
      return null;
    }

    return payload.data.role;
  } catch {
    return null;
  }
}

function redirectToHomeAndClear(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set(AUTH_ROLE_COOKIE_NAME, "", {
    httpOnly: false,
    path: "/",
    expires: new Date(0),
  });

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath =
    startsWithAny(pathname, adminPaths) || startsWithAny(pathname, studentPaths);

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const roleCookie = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;

  if (!token && isProtectedPath) {
    return redirectToHomeAndClear(request);
  }

  if (token && !roleCookie && isProtectedPath) {
    return redirectToHomeAndClear(request);
  }

  const verifiedRole = token ? await resolveSessionRole(request) : null;

  if (token && !verifiedRole) {
    return redirectToHomeAndClear(request);
  }

  if (token && startsWithAny(pathname, authPaths)) {
    const target = verifiedRole === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (startsWithAny(pathname, adminPaths) && verifiedRole !== "ADMIN") {
    return redirectToHomeAndClear(request);
  }

  if (startsWithAny(pathname, studentPaths) && verifiedRole !== "STUDENT") {
    return redirectToHomeAndClear(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
