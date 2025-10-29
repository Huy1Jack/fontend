'use server'

import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/app/sever/authcookie/route";

export async function GET() {
  try {
    // Clear the auth cookie
    clearAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: "Đăng xuất thành công"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Lỗi khi đăng xuất"
    }, { status: 500 });
  }
}

