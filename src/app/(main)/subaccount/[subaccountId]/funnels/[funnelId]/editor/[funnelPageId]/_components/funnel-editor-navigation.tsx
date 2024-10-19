'use client'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { saveActivityLogsNotification, upsertFunnelPage } from '@/lib/queries'
import { convertObjectToStringCss, convertObjectToStringHtml, convertObjectToStringReact, cssFormat, cssFormatCompiler, htmlFormat, htmlFormatCompiler, marginChecker, paddingChecker, paddingCheckerContainer, reactFormat, reactFormatCompiler, resetCssFormat, resetHtmlFormat, resetReactFormat } from '@/lib/utils'
import { DeviceTypes, EditorElement, useEditor } from '@/providers/editor/editor-provider'
import { FunnelPage } from '@prisma/client'
import clsx from 'clsx'
import {
  ArrowLeftCircle,
  DownloadCloud,
  EyeIcon,
  Laptop,
  Redo2,
  RemoveFormattingIcon,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { FocusEventHandler, useEffect, useState } from 'react'
import Image from 'next/image'


type Props = {
  funnelId: string
  funnelPageDetails: FunnelPage
  subaccountId: string
}

const FunnelEditorNavigation = ({
  funnelId,
  funnelPageDetails,
  subaccountId,
}: Props) => {
  const router = useRouter()
  const { state, dispatch } = useEditor()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    dispatch({
      type: 'SET_FUNNELPAGE_ID',
      payload: { funnelPageId: funnelPageDetails.id },
    })
  }, [funnelPageDetails])


 

  const handleDownloadHtml = () => {
    htmlFormatCompiler(state.editor.elements[0])
    const data = htmlFormat;
    const blob = new Blob([data], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GreatWeb.html";
    a.click();
    URL.revokeObjectURL(url);
    resetHtmlFormat()
  };

  const handleDownloadReact = () => {
    reactFormatCompiler(state.editor.elements[0])
    const data = reactFormat;
    const blob = new Blob([data], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GreatWeb.html";
    a.click();
    URL.revokeObjectURL(url);
    resetReactFormat()
  };

  const handleDownloadCss = () => {
    cssFormatCompiler(state.editor.elements[0])
    const data = cssFormat;
    const blob = new Blob([data], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GreatWeb.html";
    a.click();
    URL.revokeObjectURL(url);
    resetCssFormat()
  };



  


  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (
    event
  ) => {
    if (event.target.value === funnelPageDetails.name) return
    if (event.target.value) {
      await upsertFunnelPage(
        subaccountId,
        {
          id: funnelPageDetails.id,
          name: event.target.value,
          order: funnelPageDetails.order,
        },
        funnelId
      )

      toast({
        title: 'Success!',
        description: 'Saved Funnel Page title',
      })
      router.refresh()
    } else {
      toast({
        title: 'Oopse!',
        description: 'You need to have a title!',
      })
      event.target.value = funnelPageDetails.name
    }
  }

  const handlePreviewClick = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
    dispatch({ type: 'TOGGLE_LIVE_MODE' })
  }

  const handleUndo = () => {
    dispatch({ type: 'UNDO' })
  }

  const handleRedo = () => {
    dispatch({ type: 'REDO' })
  }

  const handleOnSave = async () => {
    setLoading(true)
    const content = JSON.stringify(state.editor.elements)

    try {
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...funnelPageDetails,
          content,
        },
        funnelId
      )
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a funnel page | ${response?.name}`,
        subaccountId: subaccountId,
      })
      toast({
        title: 'Success',
        description: 'Saved Editor',
      })
    } catch (error) {
      toast({
        title: 'Oppse!',
        description: 'Could not save editor',
      })
    }
    setLoading(false)
  }

  return (
    <TooltipProvider>
      <nav
        className={clsx(
          'border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all',
          { '!h-0 !p-0 !overflow-hidden': state.editor.previewMode }
        )}
      >
        <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
          <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
            <ArrowLeftCircle />
          </Link>
          <div className="flex flex-col w-full ">
            <Input
              defaultValue={funnelPageDetails.name}
              className="border-none h-5 m-0 p-0 text-lg"
              onBlur={handleOnBlurTitleChange}
            />
            <span className="text-sm text-muted-foreground">
              Path: /{funnelPageDetails.pathName}
            </span>
          </div>
        </aside>
        <aside>
          {/**set default value */}
          <Tabs
            defaultValue="Desktop" 
            className="w-fit "
            value={state.editor.device}
            onValueChange={(value) => {
              dispatch({
                type: 'CHANGE_DEVICE',
                // set payload
                payload: { device: value as DeviceTypes },
              })
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Desktop"
                    className="data-[state=active]:bg-muted w-10 h-10 p-0"
                  >
                    <Laptop />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desktop</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Tablet"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Tablet />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tablet</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Mobile"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Smartphone />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mobile</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </aside>
        <aside className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800"
          >
          <DownloadCloud/>
          </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Button
              variant={'ghost'}
              size={'default'}
              className="hover:bg-slate-800"
              onClick={handleDownloadCss}
              >
                <Image 
                  src={'/assets/icons8-css.svg'}
                  width={32}
                  height={32}
                  alt='css logo'
                  />
                  <span>Css</span>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button
              variant={'ghost'}
              size={'default'}
              className="hover:bg-slate-800"
              onClick={handleDownloadHtml}
              >
                <Image 
                  src={'/assets/icons8-html.svg'}
                  width={32}
                  height={32}
                  alt='html logo'
                  />
                  <span>Html</span>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button
              variant={'ghost'}
              size={'default'}
              className="hover:bg-slate-800"
              onClick={handleDownloadReact}
              >
                <Image 
                  src={'/assets/icons8-react.svg'}
                  width={32}
                  height={32}
                  alt='react logo'
                  />
                  <span>React</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          <Button
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800"
            onClick={handlePreviewClick}
          >
            <EyeIcon />
          </Button>
          <Button
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800"
          >
            <Undo2 />
          </Button>
          <Button
            disabled={
              !(state.history.currentIndex < state.history.history.length - 1)
            }
            onClick={handleRedo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800 mr-4"
          >
            <Redo2 />
          </Button>
          <div className="flex flex-col item-center mr-4">
            <div className="flex flex-row items-center gap-4">
              Draft
              <Switch
                disabled
                defaultChecked={true}
              />
              Publish
            </div>
            <span className="text-muted-foreground text-sm">
              Last updated {funnelPageDetails.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <Button onClick={handleOnSave}>{loading? <Loading/>: 'Save'}</Button>
        </aside>
      </nav>
    </TooltipProvider>
  )
}

export default FunnelEditorNavigation