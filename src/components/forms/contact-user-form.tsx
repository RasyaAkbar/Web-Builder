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
import { saveActivityLogsNotification, upsertContact } from '@/lib/queries'
import { db } from '@/lib/db'
import { toast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import Loading from '../loading'
import { Button } from '../ui/button'
import { useModal } from '@/providers/modal-provider'

type Props = {
    subaccountId: string
}

const ContactForm = ({ subaccountId }: Props) => {
    const { setClose, data } = useModal()
    const router = useRouter()
    const ContactFormSchema = z.object({
        name: z.string().min(2,{ message: 'Contact name must be atleast 2 characters'}),
        email: z.string().email()
    })
    const form = useForm<z.infer<typeof ContactFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(ContactFormSchema),
        defaultValues: {
          name: '',
          email: '',
        },
      })
    const isLoading = form.formState.isLoading

    useEffect(() => {
      if(data.contact){
        form.reset(data.contact)
      }
    },[data.contact, form.reset])

    const onSubmit = async (values: z.infer<typeof ContactFormSchema>) => {
        try {
          const response = await upsertContact({
            ...values,
            subAccountId: subaccountId
          })
          await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Updated a contact | ${response?.name}`,
            subaccountId,
          })
    
          toast({
            title: 'Success',
            description: 'Saved  details',
          })
          router.refresh()
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Oppse!',
            description: 'Could not save contacts details',
          })
        }
        setClose()
      }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact's email</FormLabel>
                  <FormControl>
                  <Input
                      placeholder="Email"
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

export default ContactForm