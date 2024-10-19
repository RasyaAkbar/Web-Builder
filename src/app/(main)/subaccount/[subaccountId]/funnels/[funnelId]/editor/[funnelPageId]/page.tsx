import { db } from '@/lib/db'
import EditorProvider from '@/providers/editor/editor-provider'
import { redirect } from 'next/navigation'
import React, { useState } from 'react'
import FunnelEditorNavigation from './_components/funnel-editor-navigation'
import FunnelEditorSidebar from './_components/funnel-editor-sidebar'
import FunnelEditor from './_components/funnel-editor'
import { getFunnelPageDetails, getMedia } from '@/lib/queries'

type Props = {
  params: {
    subaccountId: string
    funnelId: string
    funnelPageId: string
  }
}

const Page = async ({ params }: Props) => {
  const funnelPageDetails = await db.funnelPage.findFirst({
    where: {
      id: params.funnelPageId,
    },
  })
  if (!funnelPageDetails) {
    return redirect(
      `/subaccount/${params.subaccountId}/funnels/${params.funnelId}`
    )
  }
    
  
    const initialData = async() =>{
      const response = await getFunnelPageDetails(params.funnelPageId);
      return (response && response.content) ? JSON.parse(response.content) : null
    }
    const data = await initialData()
    const media = await getMedia(params.subaccountId)
  return (
    <div className="fixed max-h-screen top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        subaccountId={params.subaccountId}
        funnelId={params.funnelId}
        pageDetails={funnelPageDetails}
      >
        <FunnelEditorNavigation
          funnelId={params.funnelId}
          funnelPageDetails={funnelPageDetails}
          subaccountId={params.subaccountId}
        />
        <div className="h-full flex justify-center ">
          <FunnelEditor funnelPageId={params.funnelPageId} initialData={data} /> 
          
        </div>
        <FunnelEditorSidebar subaccountId={params.subaccountId} media={media}/> 
        
      </EditorProvider>
    </div>
  )
}

export default Page