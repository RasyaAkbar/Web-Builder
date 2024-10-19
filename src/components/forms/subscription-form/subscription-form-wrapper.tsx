'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { pricingCards } from '@/lib/constants'
import { useModal } from '@/providers/modal-provider'
import { Plan, Subscription } from '@prisma/client'

import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { getSubcription } from '@/lib/queries'
import Loading from '@/components/loading'
import SubscriptionForm from '.'
import { CreditCard} from 'lucide-react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { currentUser } from '@clerk/nextjs/server'
import CustomModal from '@/components/custom-modal'
import PaymentForm from '../payment-form'

type Props = {
  customerId: string
  planExists: boolean
  agencyId: string
  currentPlan?: Subscription | null
}

const SubscriptionFormWrapper = ({ customerId, planExists, agencyId, currentPlan}: Props) => {
  const { data, setClose, setOpen } = useModal()
  const router = useRouter()
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | ''>(
    data?.plans?.defaultPriceId || ''
  )
  const [subscription, setSubscription] = useState<{
    subscriptionId: string
    clientSecret: string
  }>({ subscriptionId: '', clientSecret: '' })


  /*useEffect(() => {
    if (!selectedPriceId) return
    const createSecret = async () => {
      const subscriptionResponse = await fetch(
        '/api/stripe/create-subscription',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            priceId: selectedPriceId,
          }),
        }
      )
      const subscriptionResponseData = await subscriptionResponse.json()
      setSubscription({
        clientSecret: subscriptionResponseData.clientSecret,
        subscriptionId: subscriptionResponseData.subscriptionId,
      })
      if (planExists) {
        toast({
          title: 'Success',
          description: 'Your plan has been successfully upgraded!',
        })
        setClose()
        router.refresh()
      }
    }
    createSecret()
  }, [data, selectedPriceId, customerId]) */

  const handleCardPay = () => {

  }

  const handleGoPay = () => {
    setOpen(
      <CustomModal
        title='Gopay Details'
        subheading='Enter registered gopay number'
      >
        <PaymentForm url={`http://localhost:3000/agency/${agencyId}/billing/${selectedPriceId}/confirmation`}/>
      </CustomModal>
    )
  }

  
  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4 ">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => setSelectedPriceId(price.id as Plan)}
            key={price.id}
            className={clsx('relative cursor-pointer transition-all', {
              'border-primary': selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${price.unit_amount ? price.unit_amount  : '0'}
                <p className="text-sm text-muted-foreground">
                  {price.nickname}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    pricingCards.find((p) => p.priceId === price.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>
            {(selectedPriceId === price.id && (!currentPlan || (currentPlan && currentPlan.priceId != selectedPriceId))) && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
            {(selectedPriceId === price.id && (currentPlan && currentPlan.priceId == selectedPriceId)) && (
              <Button
                  size={'sm'}
                  variant={'destructive'}
                  className='text-red-600 w-20 hover:bg-red-600 hover:text-white absolute top-4 right-4'
              >
                {/* WIP: this will set status in prisma Subscription model to 'disabled' */}
                  Cancel
              </Button>
            )}
          </Card>
        ))}

        {selectedPriceId && (!currentPlan || currentPlan.priceId != selectedPriceId) && (
          <>
          {/* WIP: make adjustments to their plan if they're subscribed to a plan*/}
            <h1 className="text-xl">Payment Method</h1>
            <Card
            onClick={handleCardPay}
            key='card'
            className={clsx('relative cursor-pointer transition-all hover:border-primary', {/*
              'border-primary': selectedPriceId === price.id,
            */})}
          >{/* WIP: make card payment method */}
          {/** WIP: If plan exist then just change the plan Ex: $199 -> $49  could be achieved by storing multiple subs in agency*/}
            <CardHeader>
              <CardTitle>
                Card
                <p className="text-sm text-muted-foreground">
                  Use card payment
                </p>
                <p className="text-sm text-muted-foreground">
                  Using card for payment method
                </p>
              </CardTitle>
            </CardHeader>
            {/*selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )*/}
          </Card>
            <Card
            onClick={handleGoPay}
            key='gopay'
            className={clsx('relative cursor-pointer transition-all hover:border-primary', {/*
              'border-primary': selectedPriceId === price.id,
            */})}
          >
            <CardHeader>
              <CardTitle>
                Gopay
                <p className="text-sm text-muted-foreground">
                  Use gopay payment
                </p>
                <p className="text-sm text-muted-foreground">
                  Using gopay phone number for payment
                </p>
              </CardTitle>
            </CardHeader>
            {/*selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )*/}
          </Card>
          </>
        )}

        {/*selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )*/}
      </div>
    </div>
  )
}

export default SubscriptionFormWrapper