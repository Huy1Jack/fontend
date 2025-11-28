import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/books/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Failed to add book" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error adding book:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}