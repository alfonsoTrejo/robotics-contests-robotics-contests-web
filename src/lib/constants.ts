export const APP_NAME = "RCMS";
export const APP_DESCRIPTION = "Robotics Contest Management System";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:8080/api";

export const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "rcms_token";

export const AUTH_ROLE_COOKIE_NAME = "rcms_role";
