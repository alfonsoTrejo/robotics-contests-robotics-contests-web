export function extractCookieValue(
  setCookieHeader: string | null,
  cookieName: string,
): string | null {
  if (!setCookieHeader) {
    return null;
  }

  const expression = new RegExp(`${cookieName}=([^;]+)`);
  const match = setCookieHeader.match(expression);

  return match?.[1] ?? null;
}
