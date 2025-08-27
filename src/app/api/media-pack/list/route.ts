import { NextResponse } from 'next/server'
export async function GET(){ return NextResponse.json({ items:[{id:'mp_123', variant:'default'}] }) }
