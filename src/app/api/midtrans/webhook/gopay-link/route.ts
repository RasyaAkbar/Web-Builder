import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import Midtrans from 'midtrans-client';
import { NextResponse } from 'next/server';
// Create Core API / Snap instance (both have shared `transactions` methods)


export async function POST(request: Request) {
    try {
        const notif = await request.json()
        console.log('heyooo')
        await db.gopayNotification.update({
            where:{
                account_id: notif.account_id
            },
            data:{
                status: "ENABLED"
            }
        })
        console.log("oyeee")
    console.log(notif)
    return NextResponse.json({ notif }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({status: 500})
    }
    
}