import { EditorElement } from "@/providers/editor/editor-provider"
import RecursiveElement from "./recursive-element"
import StaticElement from "./static-element"

type Props = {
    element: EditorElement
  }
  
  const Recursive = ({ element }: Props) => {
    if(Array.isArray(element.content)){
        return <RecursiveElement element={element}/>
    }else{
        return <StaticElement element={element}/>
    }
}

export default Recursive