import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
  }

  // Redirect /en/* routes to remove /en prefix
  if (pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/en", "");
    return NextResponse.redirect(url);
  }

  // Redirect /fr/* routes to /en/* (or just remove locale)
  if (pathname.startsWith("/fr/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/fr", "");
    return NextResponse.redirect(url);
  }

  // Handle root - redirect to dashboard
  if (pathname === "/" || pathname === "/en" || pathname === "/fr") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rewrite routes to include /en internally but keep URL clean
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/market") || pathname.startsWith("/posts") || pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Let i18n middleware handle the rest
  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
