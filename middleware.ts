import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = "https://jrxshopwmqynwyiqhyza.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeHNob3B3bXF5bnd5aXFoeXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTU3MDMsImV4cCI6MjA5NDY5MTcwM30.J5oiSzU7nFWphQv46kP2TYOmPElhCL3-adHiXfRiSdU";

const ADMIN_ROLES = ["admin_global", "store_manager", "seller", "financeiro", "estoque"];
const DRIVER_ROLE = "entregador";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Public login pages ──────────────────────────────────────────────────
  if (pathname === "/admin/login") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile && ADMIN_ROLES.includes(profile.role)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return response;
  }

  if (pathname === "/entregador/login") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === DRIVER_ROLE) {
        return NextResponse.redirect(new URL("/entregador/dashboard", request.url));
      }
    }
    return response;
  }

  // ── Customer protected routes ────────────────────────────────────────────
  const customerProtected = ["/checkout", "/perfil", "/pedidos"];
  if (customerProtected.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Admin app (strictly admin roles only) ────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ── Entregador app (strictly entregador role only) ───────────────────────
  if (pathname.startsWith("/entregador")) {
    if (!user) {
      return NextResponse.redirect(new URL("/entregador/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== DRIVER_ROLE) {
      return NextResponse.redirect(new URL("/entregador/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/health).*)",
  ],
};
