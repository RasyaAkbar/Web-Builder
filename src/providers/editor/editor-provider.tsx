'use client'
import { EditorBtns } from '@/lib/constants'
import { EditorAction } from './editor-actions'
import { Dispatch, createContext, useContext, useEffect, useReducer } from 'react'
import { FunnelPage } from '@prisma/client'
import { v4 } from 'uuid'

export type DeviceTypes = 'Desktop' | 'Mobile' | 'Tablet'

export type EditorElement = { // editor element type
  id: string
  styles: React.CSSProperties
  name: string
  type: EditorBtns // editor element have various types
  content: EditorElement[] | { href?: string; innerText?: string; src?: string } // editor element content can be static or recursive
}

export type Editor = { // the entire editor current state
  liveMode: boolean 
  elements: EditorElement[] // editor contains many editor element
  selectedElement: EditorElement // selected element
  copiedElement: EditorElement // copied element
  device: DeviceTypes
  previewMode: boolean // preview mode
  funnelPageId: string
  openSidebar: boolean
}

export type HistoryState = { //history state used for undo, redo feature
  history: Editor[] // each changes will append current state to this history array
  currentIndex: number
}

export type EditorState = { // Editor state will store current state and history of the state
  editor: Editor
  history: HistoryState
  check: boolean
  dragOverPositions: { [containerId: string]: number }
}

const initialEditorState: EditorState['editor'] = { //first current editor state
  elements: [ // first element
    {
      content: [],
      id: '__body',
      name: 'Body',
      styles: {},
      type: '__body',
    },
  ],
  selectedElement: { // selected element
    id: '',
    content: [], //can be recursive. Ex: content[content[...]]
    name: '',
    styles: {},
    type: null,
  },
  copiedElement: { // copied element
    id: '',
    content: [], //can be recursive. Ex: content[content[...]]
    name: '',
    styles: {},
    type: null,
  },
  device: 'Desktop',
  previewMode: false,
  liveMode: false,
  funnelPageId: '',
  openSidebar: true
}

const initialHistoryState: HistoryState = {  //first history state
  history: [initialEditorState], 
  currentIndex: 0,
}

const initialState: EditorState = { // first state of the entire editor (current editor state + history)
  editor: initialEditorState,
  history: initialHistoryState,
  check: false,
  dragOverPositions: {}
}

const addAnElement = (
  editorArray: EditorElement[],
  action: EditorAction
): EditorElement[] => {
  if (action.type !== 'ADD_ELEMENT' && action.type !== 'CUSTOM')
    throw Error(
      'You sent the wrong action type to the Add Element editor State'
    )
    //Note: static elements need to have a container, container by default is __body
  return editorArray.map((item) => {
    // If the item is the target container (identified by matching containerId) 
    // and its content is an array (indicating it's a container that can hold other elements)
    if (item.id === action.payload.containerId && Array.isArray(item.content)) {
      if(typeof action.payload.insertIndex !== "undefined" ){
        const newContent = [...item.content];
        //@ts-ignore
        newContent.splice(action.payload.insertIndex, 0, action.payload.elementDetails); // Insert element at the calculated position
        return {
          ...item,
          content: newContent,
        };
      }else{ // if they drop it outside drop zone then put the item at the very bottom by default
        return {
          ...item,
          content: [...item.content, action.payload.elementDetails],
        }
      }
    }else if (item.content && Array.isArray(item.content)) { // If the item has content and the content is an array (indicating it's a container)
      return {
        ...item,
        content: addAnElement(item.content, action), // put recursion until static element reached
      }
    }
    return item // return unchanged
  })
}


const moveAnElement = (
  editorArray: EditorElement[],
  action: EditorAction,
): EditorElement[] => {
  if (action.type !== 'MOVE_ELEMENT')
    throw Error(
      'You sent the wrong action type to the Move Element editor State'
    )
    
    //Note: static elements need to have a container, container by default is __body
    const newEditorArray = deleteAnElement([...editorArray], { type: "CUSTOM", payload: { elementDetails: action.payload.elementDetails }}) // WIP: Clean this
    return newEditorArray.map((item) => {
    // If the item is the target container (identified by matching containerId) 
    // and its content is an array (indicating it's a container that can hold other elements)
    if (item.id === action.payload.containerId && Array.isArray(item.content)) {
      if(typeof action.payload.insertIndex !== "undefined" ){
        const newContent = [...item.content];
        //@ts-ignore
        newContent.splice(action.payload.insertIndex, 0, action.payload.elementDetails); // Insert element at the calculated position
        return {
          ...item,
          content: newContent,
        };
      }else{// if they drop it outside drop zone then put the item at the very bottom by default
        return {
          ...item,
          content: [...item.content, action.payload.elementDetails],
        }
      }
    
    } else if (item.content && Array.isArray(item.content)) { // If the item has content and the content is an array (indicating it's a container)

      return {
        ...item,
        content: moveAnElement(item.content, action), // put recursion until static element reached
      }
    }
    return item // return unchanged
  })
  //console.log(editorArray.map((item)=>JSON.stringify(item)))
  //return editorArray
}

const updateAnElement = (
  editorArray: EditorElement[],
  action: EditorAction
): EditorElement[] => {
  if (action.type !== 'UPDATE_ELEMENT') {
    throw Error('You sent the wrong action type to the update Element State')
  }
  return editorArray.map((item) => {
    if (item.id === action.payload.elementDetails.id) { // if this is the element user want to update
      return { ...item, ...action.payload.elementDetails }
    } else if (item.content && Array.isArray(item.content)) { // if its in container
      return {
        ...item,
        content: updateAnElement(item.content, action), // put recursion until static element reached
      }
    }
    return item // return unchanged
  })
}

const deleteAnElement = (
  editorArray: EditorElement[],
  action: EditorAction
): EditorElement[] => {
  if (action.type !== 'DELETE_ELEMENT' && action.type !== 'CUSTOM'){
    throw Error(
      'You sent the wrong action type to the Delete Element editor State'
    )}
    return editorArray.reduce((accumulator: EditorElement[], currentItem: EditorElement) => {
      if (currentItem.id === action.payload.elementDetails.id) {
        // Skip the currentItem to delete
        return accumulator;
      } else if (currentItem.content && Array.isArray(currentItem.content)) {
        // Recreate the currentItem with a new content array
        return [
          ...accumulator,
          {
            ...currentItem,
            content: deleteAnElement(currentItem.content, action), // Recurse with a new array
          },
        ];
      } else {
        // Include the currentItem unchanged
        return [...accumulator, currentItem];
      }
      }, []);
}

export const changeId = (
  copiedElement: EditorElement,
): EditorElement => {
  if(Array.isArray(copiedElement.content)){
    return {
      ...copiedElement,
      content: copiedElement.content.map((item)=>changeId(item)),
      id: v4()
    }
  }
  return {
    ...copiedElement,
    id: v4()
  }
}

const editorReducer = (
  state: EditorState = initialState, // default to initial state
  action: EditorAction
): EditorState => {
  
  switch (action.type) {
    case 'ADD_ELEMENT':
      const updatedEditorState = { // The entire editor state + new elements that are added to the editor
        ...state.editor,
        elements: addAnElement(state.editor.elements, action), 
      }
      // Update the history to include the entire updated EditorState
      const updatedHistory = [
        ...state.history.history.slice(0, state.history.currentIndex + 1), // save history until current index, even if undo or redo is invoked this will mantain relevant history
        { ...updatedEditorState }, // Save a copy of the updated state
      ]

      const newEditorState = Object.freeze({
        ...state,
        editor: updatedEditorState,
        history: {
          ...state.history,
          history: [...updatedHistory],
          currentIndex: updatedHistory.length - 1,
        },
      })
      return newEditorState

    case 'MOVE_ELEMENT':
      const updatedState = { // The entire editor state + new elements that are added to the editor
        ...state.editor,
        elements: moveAnElement(state.editor.elements, action), 
      }
      // Update the history to include the entire updated EditorState
      const updatedHistoryState = [
        ...state.history.history.slice(0, state.history.currentIndex + 1), // save history until current index, even if undo or redo is invoked this will mantain relevant history
        { ...updatedState }, // Save a copy of the updated state
      ]

      const newState = {
        ...state,
        editor: updatedState,
        history: {
          ...state.history,
          history: updatedHistoryState,
          currentIndex: updatedHistoryState.length - 1,
        },
      }

      return newState // return new state

    case 'UPDATE_ELEMENT':
      // Perform your logic to update the element in the state
      const updatedElements = updateAnElement(state.editor.elements, action) //return the updated element

      const UpdatedElementIsSelected =
        state.editor.selectedElement.id === action.payload.elementDetails.id // check if updated element is selected

      const updatedEditorStateWithUpdate = {  // current editor state with update
        ...state.editor,
        elements: updatedElements,
        selectedElement: UpdatedElementIsSelected  //if updated element is selected change the selected element to this element else not select any (clicked off)
          ? action.payload.elementDetails
          : {
              id: '',
              content: [],
              name: '',
              styles: {},
              type: null,
            },
      }

      const updatedHistoryWithUpdate = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateWithUpdate }, // Save a copy of the updated state
      ]
      const updatedEditor = {
        ...state,
        editor: updatedEditorStateWithUpdate,
        history: {
          ...state.history,
          history: updatedHistoryWithUpdate,
          currentIndex: updatedHistoryWithUpdate.length - 1,
        },
      }
      return updatedEditor //return updated editor state

    case 'DELETE_ELEMENT':
      // Perform your logic to delete the element from the state

      const updatedElementsAfterDelete = deleteAnElement(
        state.editor.elements,
        action
      )
      const updatedEditorStateAfterDelete = { //current editor state after delete
        ...state.editor,
        elements: updatedElementsAfterDelete,
      }
      const updatedHistoryAfterDelete = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        {...updatedEditorStateAfterDelete}, // Save a copy of the updated state
      ]

      const deletedState = {
        ...state,
        editor: updatedEditorStateAfterDelete,
        history: {
          ...state.history,
          history: updatedHistoryAfterDelete,
          currentIndex: updatedHistoryAfterDelete.length - 1,
        },
      }
      return deletedState // return editor state after delete

    case 'CHANGE_CLICKED_ELEMENT':
      const clickedState = {
        ...state,
        editor: {
          ...state.editor,
          selectedElement: action.payload.elementDetails || {
            id: '',
            content: [],
            name: '',
            styles: {},
            type: null,
          },
        },
        
      }
      return clickedState //return the clicked state
    case 'CHANGE_DEVICE':
      const changedDeviceState = { // change the device state
        ...state,
        editor: {
          ...state.editor,
          device: action.payload.device,
        },
      }
      return changedDeviceState //return the state

    case 'TOGGLE_PREVIEW_MODE':
      const toggleState = {
        ...state,
        editor: {
          ...state.editor,
          previewMode: !state.editor.previewMode, //the opposite of previous bool value (true/false)
        },
      }
      return toggleState

    case 'TOGGLE_OPEN_SIDEBAR':
      const toggleOpenState = {
        ...state,
        editor: {
          ...state.editor,
          openSidebar: !state.editor.openSidebar, //the opposite of previous bool value (true/false)
        },
      }
      return toggleOpenState

    case 'TOGGLE_LIVE_MODE':
      const toggleLiveMode: EditorState = {
        ...state,
        editor: {
          ...state.editor,
          liveMode: action.payload
            ? action.payload.value
            : !state.editor.liveMode, // if there is a payload, put the payload value otherwise, the opposite of previous bool value (true/false)
        },
      }
      return toggleLiveMode

    case 'REDO':
      if (state.history.currentIndex < state.history.history.length - 1) { // only possible if the current index less than history.length - 1 (biggest history index)
        const nextIndex = state.history.currentIndex + 1
        const nextEditorState = { ...state.history.history[nextIndex] } // the editor will switch to the history in nextIndex in history array
        const redoState = {
          ...state,
          editor: {
            ...nextEditorState,
            copiedElement: changeId(state.editor.copiedElement)
          }, //change state
          history: {
            ...state.history, // retain the history
            currentIndex: nextIndex, 
          },
        }
        return redoState
      }
      return state // if not possible return unchanged

    case 'UNDO':
      if (state.history.currentIndex > 0) { // only possible if the current index more than 0
        const prevIndex = state.history.currentIndex - 1
        const prevEditorState = { ...state.history.history[prevIndex] } //go to prevIndex state accessed using history
        const undoState = {
          ...state,
          editor: {
            ...prevEditorState,
            copiedElement: changeId(state.editor.copiedElement)
          }, // change state
          history: {
            ...state.history,
            currentIndex: prevIndex,
          },
        }
        return undoState
      }
      return state // if not possible return unchanged

    case 'LOAD_DATA':

      return { //return editor's initial state (not include elements and liveMode)
        ...initialState,
        editor: {
          ...initialState.editor,
          elements: action.payload.elements || initialEditorState.elements, //if there is payload, use element in payload else: use in initial state
          liveMode: !!action.payload.withLive,
        },
      }

    case 'SET_FUNNELPAGE_ID':
      const { funnelPageId } = action.payload
      const updatedEditorStateWithFunnelPageId = {
        ...state.editor,
        funnelPageId,
      } // setting funnelPageId

      const updatedHistoryWithFunnelPageId = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateWithFunnelPageId }, // Save a copy of the updated state
      ]

      const funnelPageIdState = {
        ...state,
        editor: updatedEditorStateWithFunnelPageId,
        history: {
          ...state.history,
          history: updatedHistoryWithFunnelPageId,
          currentIndex: updatedHistoryWithFunnelPageId.length - 1,
        },
      }
      return funnelPageIdState

    case 'CHECK_CHANGE':
      const changeCheckState = { // change the device state
        ...state,
        editor: {
          ...state.editor
        },
        check: !state.check
      }

      return changeCheckState

    
    case 'COPY_ELEMENT':
      const copiedState = {
        ...state,
        editor: {
          ...state.editor,
          copiedElement: action.payload.elementDetails 
        },
        
      }
      return copiedState //return the copied state

    case 'PASTE_ELEMENT':
      if(state.editor.copiedElement.type === null) return state

      const pastedEditorState = {
        ...state.editor,
        elements: addAnElement(state.editor.elements, { type: 'CUSTOM', payload: { elementDetails: state.editor.copiedElement , containerId: action.payload.containerId}})
      }
      const pastedHistoryState = [
        ...state.history.history.slice(0, state.history.currentIndex + 1), // save history until current index, even if undo or redo is invoked this will mantain relevant history
        { ...pastedEditorState }, // Save a copy of the updated state
      ]
      const pastedState = {
        ...state,
        editor: {
          ...pastedEditorState,
          copiedElement: changeId(state.editor.copiedElement)
        },
        history: {
          ...state.history,
          history: pastedHistoryState,
          currentIndex: pastedHistoryState.length - 1,
        },
      }
      return pastedState
    default:
      return state // default unchanged
  }
}

export type EditorContextData = {
  device: DeviceTypes
  previewMode: boolean
  setPreviewMode: (previewMode: boolean) => void
  setDevice: (device: DeviceTypes) => void
}

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
  subaccountId: string
  funnelId: string
  pageDetails: FunnelPage | null
}>({
  state: initialState,
  dispatch: () => undefined,
  subaccountId: '',
  funnelId: '',
  pageDetails: null,
})

type EditorProps = {
  children: React.ReactNode
  subaccountId: string
  funnelId: string
  pageDetails: FunnelPage
}

const EditorProvider = (props: EditorProps) => {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        subaccountId: props.subaccountId,
        funnelId: props.funnelId,
        pageDetails: props.pageDetails,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  )
}

export const useEditor = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor Hook must be used within the editor Provider')
  }
  return context
}

export default EditorProvider