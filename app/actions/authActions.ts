'use server'

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "authToken";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

/**
 * ✅ Ghi token vào HttpOnly Secure Cookie
 * @param
 */
export async function setAuthCookie(token: string) {
    cookies().set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
    });
}

/**
 * ✅ Đọc token từ HttpOnly Secure Cookie
 * @returns
 */
export async function getAuthCookie(): string | null {
    const token = cookies().get(AUTH_COOKIE_NAME)?.value || null;
    // console.log('Token là: ', token)
    return token;
}

export async function clearAuthCookie() {
    cookies().set({
        name: AUTH_COOKIE_NAME,
        value: "",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
    });
}