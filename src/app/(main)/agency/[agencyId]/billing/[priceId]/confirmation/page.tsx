import React, { useState } from 'react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { createGopaySubscription, getAccId, getGopayToken } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { redirect, useRouter } from 'next/navigation'
import Confirmation from '@/components/confirmation'
import { useModal } from '@/providers/modal-provider'
import CustomModal from '@/components/custom-modal'
import BlurPage from '@/components/blur-page'

type Props = {
    params: { 
      priceId:string
    }
}

const page = async({params}: Props) => {
  const user = await currentUser()
    if(!user) return
    const userData = await db.user.findUnique({
        where:{
            email: user.emailAddresses[0].emailAddress
        },
    })
    if(!userData || !userData.agencyId) return // Note: No agency id == Havent registered to any agency or agency has been deleted

    const query = await db.gopayNotification.findUnique({
        where:{
          agencyId: userData.agencyId
        }
    })
    console.log(query)
    if(!query) return 
    if(query.status == "PENDING") return redirect(query.url)
    const accId = query.account_id
    const gopayToken = await getGopayToken(accId)
    if(gopayToken.account_status == "PENDING") return redirect(query.url)
    console.log(gopayToken)
  return (
    <BlurPage>
      <Confirmation gopayToken={gopayToken.metadata.payment_options[0].token} accId={accId} priceId={params.priceId}/>      
    </BlurPage>
  )
}

export default page