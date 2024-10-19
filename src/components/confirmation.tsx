'use client'
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
import { useRouter } from 'next/navigation'
type Props = {
    gopayToken: string | null
    accId: string | null
    priceId: string
}

const Confirmation = async({ gopayToken, accId, priceId }: Props) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    //@ts-ignore
    if (!gopayToken || !accId || (priceId != 'price_1OYxkqFj9oKEERu1KfJGWxgN' && priceId != 'price_1OYxkqFj9oKEERu1NbKUxXxN')) return <p>invalid params</p>
    const handleSubmit = async () => {
      try {
          setLoading(true)
          const response = await createGopaySubscription(gopayToken, accId, priceId)
          if (response){
            console.log('Subscription created')
            console.log(response)
            router.push('http://localhost:3000/agency')
          }
        }catch(error){
          console.log(error)
        }
    }
    
    
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Are you sure</CardTitle>
      </CardHeader>
      <CardContent>
            <Button
              className="w-20 mt-4"
              type="submit"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="w-20 mt-4"
              onClick={handleSubmit}
              disabled={loading}
            >
                Proceed
            </Button>
      </CardContent>
    </Card>
  )
}

export default Confirmation