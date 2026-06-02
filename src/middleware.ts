import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { isClerkConfigured } from "@/lib/clerk-config";
import { safeRedirectPath } from "@/lib/safe-redirect";

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    if (!req.nextUrl.pathname.startsWith("/setup")) {
      return NextResponse.redirect(new URL("/setup", req.url));
    }
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );

  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
  ]);

  const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

  const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

  return clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();

    if (userId && isAuthPage(request)) {
      const target = safeRedirectPath(
        request.nextUrl.searchParams.get("redirect_url")
      );
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (!userId && isApiRoute(request)) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login novamente." },
        { status: 401 }
      );
    }

    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  })(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
