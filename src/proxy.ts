import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { adminUrl, isAdminHost } from "@/lib/site-urls";

// Pages on the main site that need a signed in user
const memberRoutes = [
  /^\/dashboard(\/|$)/,
  /^\/my-quizzes(\/|$)/,
  /^\/settings(\/|$)/,
  /^\/quizzes\/[^/]+\/(play|results|review)$/,
];

function needsSession(pathname: string) {
  return memberRoutes.some((route) => route.test(pathname));
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

// Everything on the admin host is served from /admin inside the app, so the
// browser sees /users while the app renders /admin/users
function handleAdminHost(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The auth API answers on both hosts
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Old /admin links keep working: /admin/users becomes /users
  if (isAdminPath(pathname)) {
    const clean = pathname.slice("/admin".length) || "/";
    return NextResponse.redirect(new URL(`${clean}${search}`, adminUrl));
  }

  // Server actions answer unauthenticated calls themselves. A redirect here
  // would reach the client as an HTML page instead of an action result.
  const isAction = request.headers.has("next-action");

  if (!isAction && pathname !== "/sign-in" && !getSessionCookie(request)) {
    const signIn = new URL("/sign-in", adminUrl);
    signIn.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(signIn);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
  return NextResponse.rewrite(url);
}

function handleMainHost(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The admin area does not exist here. This is the same 404 as any unknown
  // address, so it doesn't confirm that the area exists.
  if (isAdminPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }

  // Server actions answer unauthenticated calls themselves
  if (request.headers.has("next-action")) return NextResponse.next();

  if (needsSession(pathname) && !getSessionCookie(request)) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

// This only checks that a session cookie exists. Pages and actions still
// verify the session and the role themselves.
export function proxy(request: NextRequest) {
  if (isAdminHost(request.headers.get("host"))) {
    return handleAdminHost(request);
  }
  return handleMainHost(request);
}

export const config = {
  matcher: ["/((?!_next/|__nextjs|.*\\..*).*)"],
};
