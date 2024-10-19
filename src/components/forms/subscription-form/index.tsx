'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import React, { useState } from 'react'

type Props = {
  selectedPriceId: string | Plan
}

const SubscriptionForm = ({ selectedPriceId }: Props) => {
  const { toast } = useToast()

  const [priceError, setPriceError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!selectedPriceId) {
      setPriceError('You need to select a plan to subscribe.')
      return
    }
    setPriceError('')
    event.preventDefault()


    try {
      toast({
        title: 'Payment successfull',
        description: 'Your payment has been successfully processed. ',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description:
          'We couldnt process your payment. Please try a different card',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <Button
        disabled={false}
        className="mt-4 w-full"
      >
        Submit
      </Button>
    </form>
  )
}
export default SubscriptionForm