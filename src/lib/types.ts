
import { Contact, Lane, Notification,Pipeline, Prisma, Role, Tag, Ticket, User } from "@prisma/client";
import { db } from "./db";
import { _getTicketsWithAllRelations, getAgencyWithSub, getAuthUserDetails, getFunnels, getMedia, getPipelineDetails, getTicketsWithTags, getUserPermissions } from "./queries";
import { z } from "zod";

export type NotificationWithUser = | ({
    User: {
      id: string
      name: string
      avatarUrl: string
      email: string
      createdAt: Date
      updatedAt: Date
      role: Role
      agencyId: string | null
    }
  } & Notification)[]
| undefined

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>

const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
    agencyId: string
  ) => {
    return await db.user.findFirst({
      where: { Agency: { id: agencyId } },
      include: {
        Agency: { include: { SubAccount: true } },
        Permissions: { include: { SubAccount: true } },
      },
    })
  }

export type UsersWithAgencySubAccountPermissionsSidebarOptions =
  Prisma.PromiseReturnType<
    typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
  >

export type AuthUserWithAgencySidebarOptionsSubAccounts =
Prisma.PromiseReturnType<typeof getAuthUserDetails>

export type GetMediaFiles =
Prisma.PromiseReturnType<typeof getMedia>

export type CreateMediaTypes = Prisma.MediaCreateWithoutSubaccountInput

export type TicketAndTags = Ticket & {
  Tags: Tag[]
  Assigned: User | null
  Customer: Contact | null
}

export type LaneDetail = Lane & {
  Tickets: TicketAndTags[]
}

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1)
})
export const LaneFormSchema = z.object({
  name: z.string().min(1)
})

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})

export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>


export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<typeof getPipelineDetails>

export type TicketDetails = Prisma.PromiseReturnType<typeof _getTicketsWithAllRelations>

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'Value must be a valid price.',
  }),
})

export const GopaySchema = z.object({
  phone: z.string().min(11),
})

export type PricesList = {
  id: string;
  unit_amount: number;
  nickname: string;
}[]

export type AgencyWithSub = Prisma.PromiseReturnType<typeof getAgencyWithSub>

export type AuthUserDetail = Prisma.PromiseReturnType<typeof getAuthUserDetails>

export type FunnelsForSubAccount = Prisma.PromiseReturnType<
  typeof getFunnels
>[0]

export type UpsertFunnelPage = Prisma.FunnelPageCreateWithoutFunnelInput

export const FunnelPageSchema = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
})

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

export type Action = 'MOVE_ELEMENT' | 'ADD_ELEMENT'