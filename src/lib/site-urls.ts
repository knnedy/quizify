function readUrl(value: string | undefined, fallback: string, name: string) {
  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is not set`);
  }
  return fallback;
}

// The public site and the admin site are two hosts served by the same app
export const appUrl = readUrl(
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
  "NEXT_PUBLIC_APP_URL",
);

export const adminUrl = readUrl(
  process.env.NEXT_PUBLIC_ADMIN_URL,
  "http://admin.localhost:3000",
  "NEXT_PUBLIC_ADMIN_URL",
);

const adminHost = new URL(adminUrl).host;

// Compares the Host header, which includes the port
export function isAdminHost(host: string | null | undefined) {
  return (host ?? "").toLowerCase() === adminHost;
}
