'use client'

import { EditorElement, useEditor } from '@/providers/editor/editor-provider'
import clsx from "clsx";
import React, { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import Recursive from './recursive'

type Props = {
  element: EditorElement
}

const RecursiveElement = ({ element }: Props) => {
  const { state, dispatch } = useEditor()
  const [check, setCheck] = useState(state.editor.selectedElement.id == element.id)

  useEffect(() => {
    setCheck(state.editor.selectedElement.id == element.id)
  }, [state.editor.selectedElement.id])

  useEffect(()=>{
    if(check) {
      dispatch({
        type: 'CHANGE_CLICKED_ELEMENT',
        payload: {
          elementDetails: element
        }
      })
    }else{
      dispatch({
        type: 'CHANGE_CLICKED_ELEMENT',
        payload: {
          elementDetails: {
            id: '',
            content: [], //can be recursive. Ex: content[]
            name: '',
            styles: {},
            type: null,
          }
        }
      })
    }
  },[check])

  return (
    <Accordion
    type="multiple"
    className={clsx("w-full h-full ", {"h-[calc(100vh-96px)]": element.id==='__body'})}
    defaultValue={[]}
    
  >
    <AccordionItem
      value={element.id}
      className="pl-4 py-0 border-none "
    >
      
      <AccordionTrigger className="!no-underline "
      >
        <div 
        className="items-top flex space-x-2 w-full" 
        onClick={(e)=>
          setCheck(!check)
        }
        >
          <Checkbox id="body1" checked={check} />
          <div className="grid gap-1.5 leading-none">
          <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{element.name}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
      {Array.isArray(element.content) && (
        element.content.map((element)=>(
          <Recursive
            key={element.id}
            element={element}
          />
        ))
            )}
      </AccordionContent>
    </AccordionItem>
    </Accordion>
    )
}

export default RecursiveElement