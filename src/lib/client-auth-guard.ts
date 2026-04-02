export function redirectHomeOnUnauthorized(response: Response): boolean {
  if (response.status === 401 || response.status === 403) {
    window.location.replace("/");
    return true;
  }

  return false;
}
