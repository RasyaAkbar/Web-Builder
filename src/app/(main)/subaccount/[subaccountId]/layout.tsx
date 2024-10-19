import InfoBar from '@/components/info-bar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized/unauthorized'
import { getAuthUserDetails, getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    children: React.ReactNode
    params: { subaccountId: string }
}

const layout = async({ children, params }: Props) => {
    const agencyId = await verifyAndAcceptInvitation()
    if(!agencyId) return <Unauthorized/>
    const user = await currentUser()
    if(!user) return redirect('/')

    let notifications: any = []

    if (!user.privateMetadata.role) {//no roles
        return <Unauthorized />
    } else {
        const allPermissions = await getAuthUserDetails()
        const hasPermission = allPermissions?.Permissions.find(
        (permissions) =>
            permissions.access && permissions.subAccountId === params.subaccountId
        )
        if (!hasPermission) { // dont have permission
        return <Unauthorized />
        }
    
        const allNotifications = await getNotificationAndUser(agencyId) //notification associated with user
    
        if (
        user.privateMetadata.role === 'AGENCY_ADMIN' ||
        user.privateMetadata.role === 'AGENCY_OWNER'
        ) {
        notifications = allNotifications // if agency admin or owner they get all notif
        } else { // otherwise they only get notif that include their sub acc id
        const filteredNoti = allNotifications?.filter(
            (item) => item.subAccountId === params.subaccountId
        )
        if (filteredNoti) notifications = filteredNoti //if there is notif
        }
    }
    
    return (
        <div className="h-screen overflow-hidden">
        <Sidebar
            id={params.subaccountId}
            type="subaccount"
        />
    
        <div className="md:pl-[300px]">
            <InfoBar
            notifications={notifications}
            role={user.privateMetadata.role as Role}
            subAccountId={params.subaccountId as string}
            />
            <div className="relative">{children}</div>
        </div>
        </div>
    )
    

}

export default layout