import { Checkbox } from '@/components/ui/checkbox'
import { EditorElement, useEditor } from '@/providers/editor/editor-provider'
import React, { useEffect, useState } from 'react'

type Props = {
    element: EditorElement
}

const StaticElement = ({ element }: Props) => {
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
    <div 
        className="items-top flex space-x-2 w-full ml-4 py-1" 
        onClick={
          (e) => {
          setCheck(!check)
        }}
        >
          <Checkbox id={element.id} checked={check} />
          <div className="grid gap-1.5 leading-none">
          <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{element.name}</p>
          </div>
        </div>
  )
}

export default StaticElement