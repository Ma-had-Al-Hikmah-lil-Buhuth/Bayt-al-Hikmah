import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, LOCALE_DIRECTION, type Locale } from "@/types/database";

const PUBLIC_FILE = /\.(.*)$/;
const DEFAULT_LOCALE: Locale = "en";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public files and API routes
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ── Locale detection ──────────────────────────────────────────────────────
  const segments = pathname.split("/");
  const maybeLocale = segments[1] as Locale;
  const hasLocale = LOCALES.includes(maybeLocale);

  if (!hasLocale) {
    // Redirect to default locale
    const locale =
      (request.cookies.get("NEXT_LOCALE")?.value as Locale) || DEFAULT_LOCALE;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // ── Supabase session refresh ──────────────────────────────────────────────
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session
  await supabase.auth.getUser();

  // Set direction header for the layout
  const dir = LOCALE_DIRECTION[maybeLocale] || "ltr";
  response.headers.set("x-locale", maybeLocale);
  response.headers.set("x-direction", dir);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
