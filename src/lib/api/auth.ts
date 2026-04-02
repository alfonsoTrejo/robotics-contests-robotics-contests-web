import { apiFetch } from "@/lib/api/client";
import type { User } from "@/lib/types/domain";

export type LoginInput = {
  email: string;
  password: string;
};

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/auth/me", { method: "GET" });
}

export async function loginAdmin(input: LoginInput): Promise<User> {
  return apiFetch<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginWithGoogleIdToken(idToken: string): Promise<User> {
  return apiFetch<User>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function logout(): Promise<{ loggedOut: boolean }> {
  return apiFetch<{ loggedOut: boolean }>("/auth/logout", {
    method: "POST",
  });
}
