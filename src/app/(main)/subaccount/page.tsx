import Unauthorized from '@/components/unauthorized/unauthorized';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    searchParams: { state: string; code: string }
}

const page = async({ searchParams }: Props) => {
    const agencyId = await verifyAndAcceptInvitation()
    
    if(!agencyId) {
        
        return (<Unauthorized/>)
    }

    const user = await getAuthUserDetails()
    if(!user) return
    const getFirstSubaccountWithAccess = user.Permissions.find((permission) => permission.access === true)
    if(searchParams.state){

        const spl =searchParams.state.split('___')
        const statePath = spl[0]
        const stateSubaccountId = spl[1]
        if(!stateSubaccountId) return <Unauthorized/>
        return redirect(
            `/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`
        )
    }
    if(getFirstSubaccountWithAccess) return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`)
 
    return (

    <Unauthorized/>
  )
}

export default page