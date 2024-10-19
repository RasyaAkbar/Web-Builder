'use client'
import React, { useEffect } from 'react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getAccId, saveActivityLogsNotification, upsertContact } from '@/lib/queries'
import { db } from '@/lib/db'
import { toast } from '../ui/use-toast'
import { redirect, useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import Loading from '../loading'
import { Button } from '../ui/button'
import { useModal } from '@/providers/modal-provider'
import { GopaySchema } from '@/lib/types'


type Props = {
  url: string
}

const PaymentForm = ({ url }: Props) => {
    const { setClose, data } = useModal()
    const router = useRouter()
    
    const form = useForm<z.infer<typeof GopaySchema>>({
        mode: 'onChange',
        resolver: zodResolver(GopaySchema),
        defaultValues: {
          phone: data?.phone || '',
        },
      })
    const isLoading = form.formState.isLoading
    
   
    useEffect(() => {
      if(data.phone){
        form.reset({ phone: data.phone })
      }
    },[data.phone, form.reset])

    const onSubmit = async (values: z.infer<typeof GopaySchema>) => {
        try {
            data.phone = values.phone
            const auth = await getAccId(values, url)
            if(auth){
        
            if(auth.account_status == 'PENDING') return router.push(auth.actions[0].url)
            }
            
            router.refresh()
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Oppse!',
            description: 'Could not save contacts details',
          })
          console.log(error)
        }
      }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gopay Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gopay Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="81234567890"
                      type='tel'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default PaymentForm