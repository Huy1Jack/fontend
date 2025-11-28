import { NextResponse } from 'next/server'
import { get_statistics } from '@/app/actions/adminActions'

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const data = await get_statistics()
    return NextResponse.json(data, { status: data?.status || 200 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Proxy error' }, { status: 500 })
  }
}

