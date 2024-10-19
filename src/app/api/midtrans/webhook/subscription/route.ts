import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const notif = await request.json()
        if (notif.event_name == "subscription.charge"){
            const agency = await db.agency.findUnique({
                where:{
                    token: notif.subscription.token
                }
            })
            // WIP: Make cancel system using 'Disabled' status in prisma Subscription model
            console.log(notif)
            if(notif.transaction.status_code == '200'){
                await db.subscriptionCharge.create({
                    data:{
                        //@ts-ignore
                        agencyId: agency.id,
                        transaction_id: notif.transaction.transaction_id,
                        active: true,
                        amount: notif.subscription.amount,
                        description: 'Transaction Successful',
                        status: '200'
                    }
                })
            }
            /* WIP: make some changes if status_code != 200 */
        }
        console.log(notif)
        return NextResponse.json({ notif }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({status: 500})
    }
    
}