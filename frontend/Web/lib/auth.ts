"use server";

import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function setAuthToken(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(env.auth.cookieName, token, {
        httpOnly: true,
        secure: env.auth.secure,
        sameSite: "lax",
        path: "/",
        maxAge: env.auth.maxAge,
    });
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(env.auth.cookieName)?.value ?? null;
}

export async function removeAuthToken(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(env.auth.cookieName);
}