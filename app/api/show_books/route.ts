import { NextResponse } from 'next/server'
import { show_books } from '@/app/sever/route'

export async function POST() {
  try {
    const data = await show_books()
    return NextResponse.json(data, { status: data?.status || 200 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Proxy error' }, { status: 500 })
  }
}


