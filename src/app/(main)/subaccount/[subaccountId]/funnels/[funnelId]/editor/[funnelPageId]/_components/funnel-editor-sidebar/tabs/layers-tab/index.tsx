'use client'
import { EditorElement, useEditor } from '@/providers/editor/editor-provider'
import React, { useEffect, useState } from 'react'
import Recursive from './recursive'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Props = {}

const LayersTab = () => {
  const { state, dispatch } = useEditor()
  const [check, setCheck] = useState(state.editor.selectedElement.id == '__body')
  
  useEffect(()=>{
    if(check) {
      dispatch({
        type: 'CHANGE_CLICKED_ELEMENT',
        payload: {
          elementDetails: state.editor.elements[0]
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
    <>
    {Array.isArray(state.editor.elements) &&
    state.editor.elements.map((childElement) => (
      <Recursive
        key={childElement.id}
        element={childElement}
      />
    ))}
    </>
  )
}

export default LayersTab