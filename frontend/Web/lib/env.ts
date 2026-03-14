export const env = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000",
    auth: {
        cookieName: process.env.AUTH_COOKIE_NAME ?? "sp_token",
        maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE ?? 604800), // 7 days
        secure: process.env.AUTH_COOKIE_SECURE === "true",
    },
} as const;
