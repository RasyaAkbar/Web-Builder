import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import DataTable from './data-table'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import SendInvitation from '@/components/forms/send-invitation'
import { getAuthUserDetails } from '@/lib/queries'

type Props = {
  params: { agencyId: string }
}

const page = async({ params }: Props) => {
  const authUser = await currentUser()
  const teamMembers = await db.user.findMany({
    where:{
      Agency:{
        id: params.agencyId
      }
    },
    include:{
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    }
  })

  if(!authUser) return
  const agencyDetails = await db.agency.findUnique({
    where:{
      id: params.agencyId
    },
    include:{
      SubAccount: true,
      Subscription: true
    }
  })
  if(!agencyDetails) return
  const condition = (!agencyDetails?.Subscription?.priceId && teamMembers.length < 2) || !!agencyDetails?.Subscription?.priceId
  
  return (
    <DataTable
    actionButtonText={
      <>
        <Plus size={15}/>
      </>
    }
    modalChildren={(condition)?<SendInvitation agencyId={agencyDetails.id}/>: null}
    filterValue='name'
    columns={columns}
    data={teamMembers}
    agencyId={agencyDetails.id}
    className ={(condition)? '': 'w-[200px]'}
    >

    </DataTable>
  )
}

export default page