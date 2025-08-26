import { NextResponse } from 'next/server'

/** 
 * Return last 10 activities (newest first). 
 * If you have a DB table, query it; else serve a demo list.
 */
export async function GET(){
  // Replace with DB query later; this keeps UI alive now.
  const now = Date.now()
  const mins = (m:number)=> new Date(now - m*60*1000).toISOString()
  
  const items = [
    { id:'1', title:'Brand Run Started', at: mins(2) },
    { id:'2', title:'AI Audit Completed', at: mins(5) },
    { id:'3', title:'New Brand Match', at: mins(10) },
    { id:'4', title:'Outreach Sent', at: mins(15) },
  ]
  
  return NextResponse.json({ ok:true, data: items })
}
