import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME ?? "sp_token";

const PROTECTED_PATHS = ["/profile", "/dashboard", "/groups", "/bills", "/friends", "/split", "/transactions"];

const AUTH_PATHS = ["/login", "/signup"];

const LANDING = "/";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(AUTH_COOKIE)?.value;

    const isProtected = PROTECTED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    const isAuth = AUTH_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    const isLanding = pathname === LANDING;

    if (!token && isProtected) {
        const url = request.nextUrl.clone();
        const callbackUrl = pathname + (request.nextUrl.search ?? "");
        url.pathname = "/login";
        url.search = `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        return NextResponse.redirect(url);
    }

    if (token && (isAuth || isLanding)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$|api/).*)",
    ],
};
