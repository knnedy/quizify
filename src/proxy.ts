import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  // Server actions answer unauthenticated calls themselves. A redirect here
  // would reach the client as an HTML page instead of an action result.
  if (request.headers.has("next-action")) return NextResponse.next();

  if (!getSessionCookie(request)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "redirect",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// This only checks that a session cookie exists. Pages and actions still
// verify the session and the role themselves.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-quizzes/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/quizzes/:slug/play",
    "/quizzes/:slug/results",
    "/quizzes/:slug/review",
  ],
};
