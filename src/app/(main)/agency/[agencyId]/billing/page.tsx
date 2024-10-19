import React from 'react'
import { addOnProducts, pricingCards } from '@/lib/constants'
import { db } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import PricingCard from './_components/pricing-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import clsx from 'clsx'
import SubscriptionHelper from './_components/subscription-helper'
import { currentUser } from '@clerk/nextjs/server'
import { getSubcription } from '@/lib/queries'

type Props = {
  params: { agencyId: string }
}

const page = async ({ params }: Props) => {
  //CHALLENGE : Create the add on  products
  const addOns = addOnProducts
  const currentPlan = await getSubcription(params.agencyId)
    


  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      Subscription: true,
    },
  })

  const prices = {
    data: [{
      id: 'price_1OYxkqFj9oKEERu1KfJGWxgN',
      unit_amount: 199,
      nickname: 'Unlimited Saas',
    }, {
      id: 'price_1OYxkqFj9oKEERu1NbKUxXxN',
      unit_amount: 49,
      nickname: 'Basic',
    }]
  }

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId
  )

  const charges = await db.subscriptionCharge.findMany({
    where:{
      agencyId: params.agencyId
    }
  })

  const allCharges = 
    charges.map((charge) => ({
      description: charge.description,
      id: charge.transaction_id,
      date: `${new Date(charge.createdAt).toLocaleDateString('en-GB')}`,
      status: charge.status == '200'? 'Paid': 'Failed',
      amount: `Rp. ${charge.amount}`,
    }))
  
    const user = await currentUser()
  
    const userData = await db.user.findUnique({
        where:{
            email: user?.emailAddresses[0].emailAddress
        },
    })
    if(!userData || !userData.agencyId) return
  return (
    <>
      <SubscriptionHelper
        prices={prices.data}
        customerId={ ''}
        planExists={agencySubscription?.Subscription?.active === true}
        agencyId={userData.agencyId}
      />
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className=" mb-6" />
      <h2 className="text-2xl p-4">Current Plan</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          agencyId={userData?.agencyId}
          planExists={agencySubscription?.Subscription?.active === true}
          prices={prices.data}
          customerId={ ''}
          amt={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || '$0'
              : '$0'
          }
          buttonCta={
            agencySubscription?.Subscription?.active === true
              ? 'Change Plan'
              : 'Get Started'
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@plura-app.com"
          highlightTitle="Plan Options"
          description={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || 'Lets get started'
              : 'Lets get started! Pick a plan that works best for you.'
          }
          duration="/ month"
          features={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === 'Starter')
                  ?.features ||
                []
          }
          title={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || 'Starter'
              : 'Starter'
          }
          currentPlan={currentPlan}
        />
        {addOns.map((addOn) => (
          <PricingCard
            //@ts-ignore
            agencyId={userData.agencyId}
            planExists={agencySubscription?.Subscription?.active === true}
            prices={prices.data}
            customerId={ ''}
            key={addOn.id}
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `$${addOn.default_price.unit_amount / 100}`
                : '$100'
            }
            buttonCta="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title={'24/7 priority support'}
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the long long with the click of a button."
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">Payment History</h2>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead className="w-[200px]">Invoice Id</TableHead>
            <TableHead className="w-[300px]">Date</TableHead>
            <TableHead className="w-[200px]">Paid</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {!allCharges && <p>No payment history</p>}
          {allCharges && allCharges.map((charge) => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">
                {charge.id}
              </TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx('', {
                    'text-emerald-500': charge.status.toLowerCase() === 'paid',
                    'text-orange-600':
                      charge.status.toLowerCase() === 'pending',
                    'text-red-600': charge.status.toLowerCase() === 'failed',
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default page