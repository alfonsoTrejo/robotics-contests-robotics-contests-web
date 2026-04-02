"use client";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/");
  }

  return (
    <Button variant="outline" size="sm" onClick={onLogout}>
      Salir
    </Button>
  );
}
