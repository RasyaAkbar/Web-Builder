"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { redirect } from "next/navigation"
import { Agency, Lane, Media, Pipeline, Plan, Prisma, Role, SubAccount, Tag, Ticket, User } from "@prisma/client"
import { v4 } from "uuid"
import { CreateFunnelFormSchema, CreateMediaTypes, GopaySchema, UpsertFunnelPage } from "./types"
import { z } from "zod"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"


export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId
}: {
    agencyId?: string,
    description: string,
    subaccountId?: string,
})=>{
    const user = await currentUser()
    let userData
    if(!user){
        const response = await db.user.findFirst({
            where: {
                Agency: {
                    SubAccount:{
                        some:{ id: subaccountId }
                    }
                }
            }
        })
        if (response){
            userData = response
        }
    } else {
        userData = await db.user.findUnique({
            where : { email: user?.emailAddresses[0].emailAddress}
        })
    }
    if(!userData){
        console.log('Could not find user')
        return
    } 
    let foundAgencyId = agencyId
    if(!foundAgencyId){
        if(!subaccountId){
            throw new Error(
                "Need to provide agency or subaccount id"
            )
        }
        const response = await db.subAccount.findUnique({
            where: { id: subaccountId }
        })
        if (response) foundAgencyId = response.agencyId
    }
    if(subaccountId){
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`, 
                User:{
                    connect:{
                        id: userData.id
                    }
                },
                Agency:{
                    connect:{
                        id: foundAgencyId
                    }
                },
                SubAccount:{
                    connect:{
                        id: subaccountId
                    }
                }
            }
        })
    }
    else{
        await db.notification.create({
            data:{
                notification: `${userData.name} | ${description}`,
                User:{
                    connect:{
                        id:userData.id,
                    }
                },
                Agency:{
                    connect:{
                        id: foundAgencyId
                    }
                }
            }
        })
    }
}

export const createTeamUser = async (agencyId: String, user: User)=>{
    if(user.role === "AGENCY_OWNER") return null
    const response = await db.user.create({ data: {...user}})
    return response
}

export const verifyAndAcceptInvitation = async () =>{
    const user = await currentUser()
    if(!user) return redirect('/sign-in')
    const invitationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: "PENDING"
        }
    })

    if (invitationExists){
        const userDetails = await createTeamUser(invitationExists.agencyId,{
            email: invitationExists.email,
            agencyId: invitationExists.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name:`${user.firstName} ${user.lastName}`,
            role: invitationExists.role,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    
        await saveActivityLogsNotification({
            agencyId: invitationExists?.agencyId,
            description: `Joined`,
            subaccountId: undefined,
        })
        if(userDetails){
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata:{
                    role: userDetails.role || 'SUBACCOUNT_USER'
                }
            })
            await db.invitation.delete({
                where: { email: userDetails.email }
            })
            return userDetails.agencyId
        }else return null
    }else{
        const agency = await db.user.findUnique({
            where:{
                email: user.emailAddresses[0].emailAddress
            }
        })
        return agency? agency.agencyId: null
    }
}

export const updateAgencyGoals = async (agencyId:string,agencyDetails:Partial<Agency>)=>{
    const response = await db.agency.update({
        where:{
            id: agencyId
        },
        data: {
            ...agencyDetails
        }
    })
    return response
}

export const deleteAgency= async(agencyId: string)=>{
    const response = await db.agency.delete({
        where: { id: agencyId }
    })
    return response
}

export const initUser = async(newUser: Partial<User>)=>{
    const user = await currentUser()
    if(!user) return

    const userData = await db.user.upsert({
        where:{
            email: user.emailAddresses[0].emailAddress
        },
        update: newUser,
        create:{
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name:`${user.firstName} ${user.lastName}`,
            role: newUser.role || 'SUBACCOUNT_USER'
        }
    })
    await clerkClient.users.updateUserMetadata(user.id,{
        privateMetadata:{
            role: newUser.role || 'SUBACCOUNT_USER'
        }
    })
    return userData
}

export const upsertAgency = async(agency: Agency, price?: Plan)=>{
    if(!agency.companyEmail) return null
    try {
        const agencyDetails = await db.agency.upsert({
            where:{
                id: agency.id
            },
            update: agency, //update at agency
            create:{ // new data that are created: connect user with company email, in sidebar option create link for agency
                users:{
                    connect: { email: agency.companyEmail}
                },
                ...agency,
                SidebarOption:{
                    create: [
                        {
                            name: 'Dashboard',
                            icon: 'category',
                            link: `/agency/${agency.id}`,
                        },
                        {
                            name: 'Launchpad',
                            icon: 'clipboardIcon',
                            link: `/agency/${agency.id}/launchpad`,
                        },
                        {
                            name: 'Billing',
                            icon: 'payment',
                            link: `/agency/${agency.id}/billing`,
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            link: `/agency/${agency.id}/settings`,
                        },
                        {
                            name: 'Sub Accounts',
                            icon: 'person',
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                            name: 'Team',
                            icon: 'shield',
                            link: `/agency/${agency.id}/team`,
                        },
                    ],
                },
                Subscription:{
                  create:{
                    priceId: '',
                    plan: null,
            active: false,
            subscription_id: ''
                  },
                }
            }
        })
        return agencyDetails
    } catch (error) {
        console.log(error)
    }
}

export const getNotificationAndUser = async (agencyId: string) => {
    try {
        const response = await db.notification.findMany({
            where: { agencyId },
            include: { User: true },
            orderBy: { createdAt: 'desc' }
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

export const upsertSubAccount = async (subAccount: SubAccount)=>{
    if(!subAccount.companyEmail) return null
    const agencyOwner = await db.user.findFirst({
        where:{
            Agency:{
                id: subAccount.agencyId
            },
            role: 'AGENCY_OWNER'
        }
    })
    if(!agencyOwner) return console.log('Not agency owner!')
    const permissionId = v4()
    const response = await db.subAccount.upsert({
        where:{
            id: subAccount.id
        },
        update: subAccount,
        create:{
            ...subAccount,
            Permissions:{
                create: {
                    access: true,
                    email: agencyOwner.email,
                    id: permissionId
                },
                connect: {
                    subAccountId: subAccount.id,
                    id: permissionId
                }
            },
            Pipeline:{
                create: {
                    name: 'Lead Cycle'
                }
            },
            SidebarOption: {
                create: [
                  {
                    name: 'Launchpad',
                    icon: 'clipboardIcon',
                    link: `/subaccount/${subAccount.id}/launchpad`,
                  },
                  {
                    name: 'Settings',
                    icon: 'settings',
                    link: `/subaccount/${subAccount.id}/settings`,
                  },
                  {
                    name: 'Funnels',
                    icon: 'pipelines',
                    link: `/subaccount/${subAccount.id}/funnels`,
                  },
                  {
                    name: 'Media',
                    icon: 'database',
                    link: `/subaccount/${subAccount.id}/media`,
                  },
                  {
                    name: 'Automations',
                    icon: 'chip',
                    link: `/subaccount/${subAccount.id}/automations`,
                  },
                  {
                    name: 'Pipelines',
                    icon: 'flag',
                    link: `/subaccount/${subAccount.id}/pipelines`,
                  },
                  {
                    name: 'Contacts',
                    icon: 'person',
                    link: `/subaccount/${subAccount.id}/contacts`,
                  },
                  {
                    name: 'Dashboard',
                    icon: 'category',
                    link: `/subaccount/${subAccount.id}`,
                  },
                ],
              },
        }
    })
    return response
}

export const getUserPermissions = async (userId: string) => {
    const response = await db.user.findUnique({
      where: { id: userId },
      select: { Permissions: { include: { SubAccount: true } } },
    })
    return response
}

export const getAuthUserDetails = async () => {
    const user = await currentUser()
    if (!user) {
      return
    }
  
    const userData = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      include: {
        Agency: {
          include: {
            SidebarOption: true,
            SubAccount: {
              include: {
                SidebarOption: true,
              },
            },
          },
        },
        Permissions: true,
      },
    })
  
    return userData
  }

export const updateUser = async (user: Partial<User>) => {
    const response = await db.user.update({
        where: { email: user.email },
        data: { ...user },
    })

    await clerkClient.users.updateUserMetadata(response.id, {
        privateMetadata: {
        role: user.role || 'SUBACCOUNT_USER',
        },
    })

    return response
}

export const changeUserPermissions= async (
    permissionId: string | undefined,
    userEmail: string,
    subAccountId: string,
    permission: boolean
) => {
    try {
        const response = await db.permissions.upsert({
            where: {
                id: permissionId
            },
            update: {
                access: permission
            },
            create:{
                access: permission,
                email: userEmail,
                subAccountId: subAccountId
            }
        })

        return response
    } catch (error) {
        console.log("Could not change permission ", error)
    }
}

export const getSubaccountDetails = async (subaccountId: string) => {
    const response = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
    })
    return response
}

export const deleteSubAccount = async (subaccountId: string) => {
    const response = await db.subAccount.delete({
      where: {
        id: subaccountId,
      },
    })
    return response
  }

export const deleteUser = async (userId: string) => {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
        role: undefined,
        },
    })
    const deletedUser = await db.user.delete({ where: { id: userId } })

    return deletedUser
}

export const getUser = async (id: string) => {
    const user = await db.user.findUnique({
        where: {
        id,
        },
    })

    return user
}

export const sendInvitation = async (
    role: Role,
    email: string,
    agencyId: string
  ) => {
    const resposne = await db.invitation.create({
      data: { email, agencyId, role },
    })
  
    try {
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: process.env.NEXT_PUBLIC_URL,
        publicMetadata: {
          throughInvitation: true,
          role,
        },
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  
    return resposne
  }

export const getMedia = async(subaccountId : string) => {
    const mediafiles = await db.subAccount.findUnique({
        where:{
            id: subaccountId
        },
        include:{
            Media: true
        }
    })
    return mediafiles
}

export const createMedia = async(subaccountId: string, mediaFiles: CreateMediaTypes) => {
    const response= await db.media.create({ data : {...mediaFiles, subAccountId: subaccountId}})
    return response
}

export const deleteMedia = async(fileId: string) => {
    const response = await db.media.delete({
        where:{
            id: fileId
        }
    })
    return response
}

export const getPipelineDetails = async (pipelineId: string) =>{
    const response = await db.pipeline.findUnique({
        where:{
            id: pipelineId
        },
    })
    return response
}

export const getLanesWithTicketAndTags = async (pipelineId:string) => {
    const response = await db.lane.findMany({
        where:{
            pipelineId
        },
        orderBy:{ order: 'asc'},
        include:{
            Tickets:{
                orderBy:{
                    order: 'asc'
                },
                include:{
                    Tags: true,
                    Assigned: true,
                    Customer: true
                }
            },
            
        }
    })
    return response
}

export const upsertFunnel = async (
    subaccountId: string,
    funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
    funnelId: string
  ) => {
    const response = await db.funnel.upsert({
      where: { id: funnelId },
      update: funnel,
      create: {
        ...funnel,
        id: funnelId || v4(),
        subAccountId: subaccountId,
      },
    })
  
    return response
  }
  
export const upsertPipeline = async (
pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
      where: { id: pipeline.id || v4() },
      update: pipeline,
      create: pipeline,
  })

  return response
}

export const deletePipeline = async(pipelineId: string)=>{
    const response = await db.pipeline.delete({
        where:{
            id: pipelineId
        }
    })
    return response
}


export const updateLanesOrder = async (lanes: Lane[]) => {
    try {
      const updateTrans = lanes.map((lane) =>
        db.lane.update({
          where: {
            id: lane.id,
          },
          data: {
            order: lane.order,
          },
        })
      )
  
      await db.$transaction(updateTrans)
      console.log('🟢 Done reordered 🟢')
    } catch (error) {
      console.log(error, 'ERROR UPDATE LANES ORDER')
    }
}
  
export const updateTicketsOrder = async (tickets: Ticket[]) => {
try {
    const updateTrans = tickets.map((ticket) =>
    db.ticket.update({
        where: {
        id: ticket.id,
        },
        data: {
        order: ticket.order,
        laneId: ticket.laneId,
        },
    })
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
} catch (error) {
    console.log(error, '🔴 ERROR UPDATE TICKET ORDER')
}
}

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
    let order: number
  
    if (!lane.order) {
      const lanes = await db.lane.findMany({
        where: {
          pipelineId: lane.pipelineId,
        },
      })
  
      order = lanes.length
    } else {
      order = lane.order
    }
  
    const response = await db.lane.upsert({
      where: { id: lane.id || v4() },
      update: lane,
      create: { ...lane, order },
    })
  
    return response
  }

export const deleteLane = async(laneId: string) =>{
    const response = await db.lane.delete({
        where:{
            id: laneId
        }
    })
    return response
}

export const getTicketsWithTags = async (pipelineId: string) => {
    const response = await db.ticket.findMany({
      where: {
        Lane: {
          pipelineId,
        },
      },
      include: { Tags: true, Assigned: true, Customer: true },
    })
    return response
  }
  
export const _getTicketsWithAllRelations = async (laneId: string)=>{
    const response = await db.ticket.findMany({
        where:{ laneId },
        include:{
            Assigned: true,
            Customer: true,
            Lane: true,
            Tags: true
        }
    })
    return response
}

export const getSubAccountTeamMembers = async (subaccountId: string) => {
    const subaccountUsersWithAccess = await db.user.findMany({
      where: {
        Agency: {
          SubAccount: {
            some: {
              id: subaccountId,
            },
          },
        },
        role: 'SUBACCOUNT_USER',
        Permissions: {
          some: {
            subAccountId: subaccountId,
            access: true,
          },
        },
      },
    })
    return subaccountUsersWithAccess
  }
  
  export const searchContacts = async (searchTerms: string) => {
    const response = await db.contact.findMany({
      where: {
        name: {
          contains: searchTerms,
        },
      },
    })
    return response
  }
  
export const upsertTicket = async (
    ticket: Prisma.TicketUncheckedCreateInput,
    tags: Tag[]
  ) => {
    let order: number
    if (!ticket.order) {
      const tickets = await db.ticket.findMany({
        where: { laneId: ticket.laneId },
      })
      order = tickets.length
    } else {
      order = ticket.order
    }
  
    const response = await db.ticket.upsert({
      where: {
        id: ticket.id || v4(),
      },
      update: { ...ticket, Tags: { set: tags } },
      create: { ...ticket, Tags: { connect: tags }, order },
      include: {
        Assigned: true,
        Customer: true,
        Tags: true,
        Lane: true,
      },
    })
  
    return response
  }

export const deleteTicket= async(id: string)=>{
  const response = await db.ticket.delete({
    where:{
      id
    }
  })
  return response
}
export const deleteTag= async(id: string)=>{
  const response = await db.tag.delete({
    where:{
      id
    }
  })
  return response
}

export const getTagsForSubaccount= async(subaccountId: string)=>{
  const response = await db.tag.findMany({
    where:{
      subAccountId: subaccountId
    },
    include:{
      SubAccount: false
    }
  })
  return response
}

export const upsertTag= async(subAccountId: string, tag: Prisma.TagUncheckedCreateInput)=>{
  const response = await db.tag.upsert({
    where: {
      id: tag.id || v4(), subAccountId
    },
    update: tag,
    create: { 
      ...tag, 
      subAccountId,// Connects to existing tickets with specified IDs
    }
  })
  return response
}

export const upsertContact = async (contact: Prisma.ContactUncheckedCreateInput) =>{
  const response = await db.contact.upsert({
    where:{
      id: contact.id || v4(), subAccountId: contact.subAccountId
    },
    update: contact,
    create:{
      ...contact,
    }
  })
  return response
}

export const getSub = async (subId: string) => {
  const options = {method: 'GET', headers: {accept: 'application/json'}};
  try{
    const response: Response = await fetch(`https://api.sandbox.midtrans.com/v1/subscriptions/${subId}`, options);
      if (!response.ok) {
        throw new Error('Network response was not ok' + response.statusText);
      }
      const json = await response.json();
      return json;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export const getAccId = async (values: z.infer<typeof GopaySchema>, url?: string) => {
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json', authorization: 'Basic U0ItTWlkLXNlcnZlci1jaWI2c1daNGd0b1k4ZFdDLVhIeHllOVI6'},
    body: JSON.stringify({
    payment_type: 'gopay',
    gopay_partner: {
        phone_number: values.phone,
        country_code: '62',
        redirect_url: url || ''
    },
    })
  };
  const response = await fetch(`https://api.sandbox.midtrans.com/v2/pay/account`, options);
  const res = await response.json()
  if(res.status_code == "202") return res
  const user = await currentUser()
  console.log
  if(!user) return
  const userData = await db.user.findUnique({
      where:{
          email: user.emailAddresses[0].emailAddress
      },
  })
  if(!userData || !userData.agencyId) return // Note: No agency id == Havent registered to any agency or agency has been deleted

  await db.gopayNotification.upsert({
    where:{
      agencyId: userData.agencyId,
    },
    update:{
      account_id: res.account_id,
      url : res.actions[0].url
    },
    create:{
      account_id: res.account_id,
      agencyId: userData.agencyId,
      url : res.actions[0].url
    }
  })
  console.log(res)
  return res
}
export const getGopayToken = async (accId:string) => {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', 'content-type': 'application/json', authorization: 'Basic U0ItTWlkLXNlcnZlci1jaWI2c1daNGd0b1k4ZFdDLVhIeHllOVI6'},
  };
  const response = await fetch(`https://api.sandbox.midtrans.com/v2/pay/account/${accId}`, options);
  let res = await response.json()
  console.log(res)
  return res
}

function getCurrentFormattedDatePlusFiveSeconds(): string {
  const now = new Date();
  now.setSeconds(now.getSeconds() + 3); // Add 5 seconds

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timezoneOffset = -now.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
  const offsetSign = timezoneOffset >= 0 ? '+' : '-';

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0700`;
}

export const createGopaySubscription= async (token:string, accId:string, name: string) => {
  const price = name == 'price_1OYxkqFj9oKEERu1KfJGWxgN'? 3000000: 800000
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json', authorization: 'Basic U0ItTWlkLXNlcnZlci1jaWI2c1daNGd0b1k4ZFdDLVhIeHllOVI6'},
    body: JSON.stringify({
        "name": "MONTHLY_2019",
        "amount": price.toString(),
        "currency": "IDR",
        "payment_type": "gopay",
        "token": token,
        "schedule": {
          "interval": 1,
          "interval_unit": "month",
          "max_interval": 12,
          "start_time": getCurrentFormattedDatePlusFiveSeconds()
        },
        "metadata": {
          "description": "Recurring payment for A"
        },
        "customer_details": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "johndoe@email.com",
          "phone": "+62812345678"
        },
        "gopay": {
          "account_id": accId
        }
    
    })
  };
  const response = await fetch(`https://api.sandbox.midtrans.com/v1/subscriptions`, options);
  const res = await response.json()

  if(res.status == "active"){
    const user = await currentUser()
  
  const userData = await db.user.findUnique({
      where:{
          email: user?.emailAddresses[0].emailAddress
      },
  })
  if(!userData || !userData.agencyId) return
  await db.agency.update({
    where:{
      //@ts-ignore
      id: userData.agencyId
    },
    data:{
      token: token
    }
  })
  const date = new Date()
  const pollInterval = 1000; // Interval in milliseconds to poll the database
const maxWaitTime = 30000; // Maximum wait time in milliseconds (30 seconds)

const pollForNotification = async () => {
  const startTime = Date.now();
  
  const checkStatus = async () => {
    const elapsedTime = Date.now() - startTime;

    if (elapsedTime >= maxWaitTime) {
      console.log('Timeout waiting for notification');
      return;
    }

    const status = await db.subscriptionCharge.findMany({
      // WIP: subscription charge should be identified by subscription_id as well
      where: {
        //@ts-ignore
        agencyId: userData.agencyId
      }
    });

    if (status.length > 0 && status[status.length - 1].status == '200') {
      console.log(status);

      await db.subscription.upsert({
        where: {
          //@ts-ignore
          agencyId: userData.agencyId
        },
        update: {
          //@ts-ignore
          plan: name,
          priceId: name,
          active: true,
          subscription_id: res.id
        },
        create: {
          //@ts-ignore
          plan: name,
          priceId: name,
          agencyId: userData.agencyId,
          active: true,
          subscription_id: res.id
        }
      });

      clearInterval(intervalId);
    } else {
      console.log('Waiting for notification...');
    }
  };

  const intervalId = setInterval(checkStatus, pollInterval);
};
  pollForNotification()  
}
  console.log(res)
  return res
}

export const getSubcription = async(agencyId: string) => {
  const response = await db.subscription.findUnique({
    where:{
      agencyId: agencyId
    }
  });
  return response
}

export const getAgencyWithSub = async(agencyId: string) =>{
  const response = await db.agency.findUnique({
    where:{
        id: agencyId
    },
    include:{
        Subscription: true
    }
})
return response
}

export const getFunnels = async (subacountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subacountId },
    include: { FunnelPages: true },
  })

  return funnels
}

export const getFunnel = async (funnelId: string) => {
  const funnels = await db.funnel.findUnique({
    where: { id: funnelId },
    include: { 
      FunnelPages: {
        orderBy:{
          order: 'asc'
        }
      } 
    },
  })

  return funnels
}

export const updateFunnelProducts = async (
  products: string,
  funnelId: string
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  })
  return data
}

export const upsertFunnelPage = async (
  subaccountId: string,
  funnelPage: UpsertFunnelPage,
  funnelId: string
) => {
  if (!subaccountId || !funnelId) return
  const response = await db.funnelPage.upsert({
    where: { id: funnelPage.id || '' },
    update: { ...funnelPage },
    create: {
      ...funnelPage,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([ //default content to render
            {
              content: [],
              id: '__body',
              name: 'Body',
              styles: { backgroundColor: 'white' },
              type: '__body',
            },
          ]),
      funnelId,
    },
  })

  revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, 'page')
  return response
}

export const deleteFunnelePage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } })

  return response
}

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  })

  return response
}


export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: {
      subDomainName,
    },
    include: { FunnelPages: true },
  })
  return response
}

export const getPipelines = async (subaccountId: string) => {
  const response = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  })
  return response
}