'use client'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useEditor } from '@/providers/editor/editor-provider'
import clsx from 'clsx'
import React from 'react'
import TabList from './tabs'
import SettingsTab from './tabs/settings-tab'
import MediaBucketTab from './tabs/media-bucket-tab'
import ComponentsTab from './tabs/components-tab'
import LayersTab from './tabs/layers-tab'
import { GetMediaFiles } from '@/lib/types'

type Props = {
  subaccountId: string
  media: GetMediaFiles
}

const FunnelEditorSidebar = ({ subaccountId, media }: Props) => {
  const { state, dispatch } = useEditor()

  return (
    <Sheet
      open={true}
      modal={false}
    >
      <Tabs
        className="w-full h-[calc(100vh-96px)]"
        defaultValue="Settings"
      >
        <SheetContent
          showX={false}
          side="right"
          className={clsx(
            'mt-[97px] w-16 z-[80] shadow-none  p-0 focus:border-none transition-all overflow-hidden',
            { hidden: state.editor.previewMode }
          )}
        >
          <TabList />
        </SheetContent>
        <SheetContent
          showX={false}
          side="right"
          className={clsx(
            'mt-[97px] w-80 z-[40] shadow-none p-0 mr-16 bg-background h-full transition-all overflow-hidden ',
            { 
              hidden: state.editor.previewMode || !state.editor.openSidebar, 
          }
          )}
        >
          <div className="grid gap-4 h-[calc(100vh-96px)] pb-36 overflow-scroll w-full">
            <TabsContent value="Settings">
              <SheetHeader className="text-left p-6">
                <SheetTitle>Styles</SheetTitle>
                <SheetDescription>
                  Show your creativity! You can customize every component as you
                  like.
                </SheetDescription>
              </SheetHeader>
              <SettingsTab />
            </TabsContent>
            <TabsContent value="Media">
              <MediaBucketTab subaccountId={subaccountId} media={media}/>
            </TabsContent>
            <TabsContent value="Layers">
              <LayersTab />
            </TabsContent>
            <TabsContent value="Components">
              <SheetHeader className="text-left p-6 ">
                <SheetTitle>Components</SheetTitle>
                <SheetDescription>
                  You can drag and drop components on the canvas
                </SheetDescription>
              </SheetHeader>
              <ComponentsTab />
            </TabsContent>
          </div>
        </SheetContent>
      </Tabs>
    </Sheet>
  )
}

export default FunnelEditorSidebar