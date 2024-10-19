import { DeviceTypes, EditorElement } from './editor-provider'

export type EditorAction = //if i want to change the editor state i have to DISPATCH one of the available action just like redux ;)
  | {
      type: 'ADD_ELEMENT'
      payload: {
        containerId: string
        elementDetails: EditorElement
        insertIndex?: number
      } // payload contains the added element informations
    }
  | {
      type: 'UPDATE_ELEMENT'
      payload: {
        elementDetails: EditorElement
      }// payload contains the updated element informations
    }
  | {
      type: 'DELETE_ELEMENT'
      payload: {
        elementDetails: EditorElement
      }// payload contains the deleted element informations
    }
  | {
      type: 'CHANGE_CLICKED_ELEMENT'
      payload: {
        elementDetails?:
          | EditorElement
          | {
              id: ''
              content: []
              name: ''
              styles: {}
              type: null
            }
      }// payload contains the currently clicked element informations
    }
  | {
      type: 'CHANGE_DEVICE'
      payload: {
        device: DeviceTypes
      }
    }// payload contains device types if they change device
  | {
      type: 'TOGGLE_PREVIEW_MODE'
    } // not display any element on preview mode
  | {
      type: 'TOGGLE_LIVE_MODE'
      payload?: {
        value: boolean
      } // if they toggle live mode it change live value (type: boolean)
    }
  | { type: 'REDO' } // redo
  | { type: 'UNDO' } // undo
  | { type: 'CHECK_CHANGE' } // change current check
  | {
      type: 'LOAD_DATA'
      payload: {
        elements: EditorElement[]
        withLive: boolean
      }
    }
  | {
      type: 'SET_FUNNELPAGE_ID'
      payload: {
        funnelPageId: string
      }
    }
    |{ 
      type: 'MOVE_ELEMENT'
      payload: {
        containerId: string
        elementDetails: EditorElement
        insertIndex?: number
      }
    }
    |{ 
      type: 'SET_DRAG_OVER_POSITION'
      payload: {
        containerId: string
        offsetY: number
      }
    }
    |{
      type:'COPY_ELEMENT'
      payload:{
        elementDetails: EditorElement
      }
    }
    |{
      type: 'PASTE_ELEMENT'
      payload:{
        containerId: string
      }
    }|{
      type:'CUSTOM'
      payload:{
        containerId?: string
        elementDetails: EditorElement
        insertIndex?: number
      }
    }|{
      type:'TOGGLE_OPEN_SIDEBAR'
    }
