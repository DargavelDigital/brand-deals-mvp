import { NextResponse } from 'next/server'
export async function GET(){ return NextResponse.json({ items:[{id:'br_apple', name:'Apple'},{id:'br_nike', name:'Nike'}] }) }
