'use client'
import React, { useEffect, useState } from 'react'
import { SubAccount, User } from '@prisma/client'
import { AuthUserWithAgencySidebarOptionsSubAccounts, UserWithPermissionsAndSubAccounts } from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { changeUserPermissions, getAuthUserDetails, getUserPermissions, saveActivityLogsNotification, updateUser } from '@/lib/queries'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '../ui/select'
import FileUpload from '../file-upload'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../loading'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { v4 } from 'uuid'


type Props = {
    type :'agency' | 'subaccount' 
    id: string | null
    subAccounts?: SubAccount[]
    userData?: Partial<User>
}

const UserDetails = ({ id, type, userData, subAccounts }: Props) => {
    const[subAccountPermissions, setSubAccountPermissions] = useState<UserWithPermissionsAndSubAccounts | null>(null)
    const { data, setClose} = useModal()
    const [roleState, setRoleState] = useState('')
    const [loadingPermissions, setLoadingPermissions] = useState(false)
    const [authUserData, setAuthUserData] = useState<AuthUserWithAgencySidebarOptionsSubAccounts | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(()=>{
        
            const fetchDetails = async () =>{
                const response = await getAuthUserDetails()
                if(response) setAuthUserData(response) //setting auth user data, Types: authUserDetails
            }
        fetchDetails()
        
    },[])

    const userDataSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        avatarUrl: z.string(),
        role: z.enum([
          'AGENCY_OWNER',
          'AGENCY_ADMIN',
          'SUBACCOUNT_USER',
          'SUBACCOUNT_GUEST',
        ]),
      })
    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        mode: 'onChange',
        defaultValues:{
            name: userData? userData.name : data?.user?.name,
            email: userData? userData.email: data?.user?.email,
            avatarUrl: userData? userData.avatarUrl: data?.user?.avatarUrl,
            role: userData? userData.role: data?.user?.role,

        }
    })

    useEffect(() =>{
        if(!data.user) return
        const getPermissions = async () => {
            if(!data.user) return
            const permission = await getUserPermissions(data.user.id)
            setSubAccountPermissions(permission)
        }
        getPermissions()
    },[data, form])

    useEffect(() => {
        if (data.user) {
          form.reset(data.user)
        }
        if (userData) {
          form.reset(userData)
        }
      }, [userData, data])

      const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
        if (!id) return
        if (userData || data?.user) {
          const updatedUser = await updateUser(values)
          authUserData?.Agency?.SubAccount.filter((subacc) =>
            authUserData.Permissions.find(
              (p) => p.subAccountId === subacc.id && p.access
            )
          ).forEach(async (subaccount) => {
            await saveActivityLogsNotification({
              agencyId: undefined,
              description: `Updated ${userData?.name} information`,
              subaccountId: subaccount.id,
            })
          })
    
          if (updatedUser) {
            toast({
              title: 'Success',
              description: 'Update User Information',
            })
            setClose()
            router.refresh()
          } else {
            toast({
              variant: 'destructive',
              title: 'Oppse!',
              description: 'Could not update user information',
            })
          }
        } else {
          console.log('Error could not submit')
        }
      }
    
  const onChangePermission = async(subAccountId: string, val: boolean, permissionId: string | undefined)=>{
    if(!data.user?.email) return
    setLoadingPermissions(true)
    const response = await changeUserPermissions(
      permissionId ? permissionId: v4(),
      data.user.email,
      subAccountId,
      val
    )
    if (type === 'agency') {
      await saveActivityLogsNotification({ // save activity log
        agencyId: authUserData?.Agency?.id, // at this agency
        description: `Gave ${userData?.name} access to | ${ // 'Gave jhon to this {subaccount.name}'
          subAccountPermissions?.Permissions.find(
            (p) => p.subAccountId === subAccountId
          )?.SubAccount.name
        } `,
        subaccountId: subAccountPermissions?.Permissions.find( // store the subaccount id
          (p) => p.subAccountId === subAccountId
        )?.SubAccount.id,
      })
    }
    if(response){
      toast({
        title: 'Success',
        description: "The request is successful"
      })
      if(subAccountPermissions){
        subAccountPermissions.Permissions.find((permission)=> {
          if(permission.subAccountId === subAccountId){
            return { ...permission, access: !permission.access}
          } 
          return permission
        })
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: "Couldn't update permission"
      })
    }
    router.refresh()
    setLoadingPermissions(false)
  }
 
  return (
    <Card className='w-full'>
        <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Add or update your information</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-4'
                >
                    <FormField
                        disabled={form.formState.isSubmitting}
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Profile picture</FormLabel>
                            <FormControl>
                                <FileUpload
                                apiEndpoint="avatar"
                                value={field.value}
                                onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        disabled={form.formState.isSubmitting}
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel>User full name</FormLabel>
                            <FormControl>
                                <Input
                                required
                                placeholder="Full Name"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        disabled={form.formState.isSubmitting}
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                readOnly={
                                    userData?.role === 'AGENCY_OWNER' ||
                                    form.formState.isSubmitting
                                }
                                placeholder="Email"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        disabled={form.formState.isSubmitting}
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel> User Role</FormLabel>
                            <Select
                                disabled={field.value === 'AGENCY_OWNER'}
                                onValueChange={(value) => {
                                if (
                                    value === 'SUBACCOUNT_USER' ||
                                    value === 'SUBACCOUNT_GUEST'
                                ) {
                                    setRoleState(
                                    'You need to have subaccounts to assign Subaccount access to team members.'
                                    )
                                } else {
                                    setRoleState('')
                                }
                                field.onChange(value)
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user role..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="AGENCY_ADMIN">
                                    Agency Admin
                                </SelectItem>
                                {(data?.user?.role === 'AGENCY_OWNER' ||
                                    userData?.role === 'AGENCY_OWNER') && (
                                    <SelectItem value="AGENCY_OWNER">
                                    Agency Owner
                                    </SelectItem>
                                )}
                                <SelectItem value="SUBACCOUNT_USER">
                                    Sub Account User
                                </SelectItem>
                                <SelectItem value="SUBACCOUNT_GUEST">
                                    Sub Account Guest
                                </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground">{roleState}</p>
                            </FormItem>
                        )}
                        />
                        <Button
                          disabled={form.formState.isSubmitting}
                          type='submit'
                        >
                          {form.formState.isSubmitting ? <Loading/>: 'Save User Details'}
                        </Button>
                        {authUserData?.role === 'AGENCY_OWNER'&&(
                          <div>
                            <Separator className='my-4'/>
                            <FormLabel>User Permissions</FormLabel>
                            <FormDescription className='mb-4'>
                            You can give Sub Account access to team member by turning on
                  access control for each Sub Account. This is only visible to
                  agency owners
                            </FormDescription>
                            <div className='flex flex-col gap-4'>
                              
                              {subAccounts?.map((subAccount)=>{
                                const subAccountPermissionsDetails = subAccountPermissions?.Permissions.find((p)=>p.subAccountId === subAccount.id)
                                return(
                                  
                                <div key={subAccount.id} className='flex items-center justify-between rounded-lg border p-4'>
                                  <div>
                                  <p>{subAccount.name}</p>
                                  </div>
                                <Switch
                                  disabled={loadingPermissions}
                                  checked={subAccountPermissionsDetails?.access}
                                  onCheckedChange={(permission) => {
                                    onChangePermission(subAccount.id,permission, subAccountPermissionsDetails?.id)
                                  }}
                                />
                                </div>
                              )})}
                            </div>
                          </div>
                        )}
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}

export default UserDetails