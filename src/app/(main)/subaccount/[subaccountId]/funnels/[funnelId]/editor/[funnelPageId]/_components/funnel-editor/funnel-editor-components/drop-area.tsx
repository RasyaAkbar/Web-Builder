import { Action } from "@/lib/types";
import { isDescendant } from "@/lib/utils";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import React, { useState } from "react";
import clsx from "clsx";

type Props = {
  container: EditorElement;
  index: number;
};

const DropArea = ({ container, index }: Props) => {
  const [showDropArea, setShowDropArea] = useState(false);
  const { dispatch, state } = useEditor();

  const handleOnDrop = (e: React.DragEvent, type: string) => {
    e.stopPropagation();
    const componentType = e.dataTransfer
      .getData("componentType")
      .split("*&#^$");
    
      const element = JSON.parse(componentType[1])

      
    switch (componentType[0] as Action) {
      case "MOVE_ELEMENT":
        if((Array.isArray(element.content) && !isDescendant(container.id, element) && container.id!==element.id) || !Array.isArray(element.content) ){
        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            containerId: container.id,
            elementDetails: element,
            insertIndex: index,
          },
        });
      }
        break;
      case "ADD_ELEMENT":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: container.id,
            elementDetails: { ...element },
            insertIndex: index,
          },
        });
        break;
    }
    setShowDropArea(false);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDropArea(true);
      }}
      onDragLeave={() => setShowDropArea(false)}
      onDrop={(e) => handleOnDrop(e, container.id)}
      className={clsx('opacity-0 h-[10px]',{
        'opacity-0 w-[10px] h-full': container.styles.display === 'flex',
         "h-[30px] w-full opacity-100": showDropArea,
         "w-[30px] h-full opacity-100": showDropArea && container.styles.display === 'flex',
        'hidden': state.editor.liveMode || state.editor.previewMode // dont show drop area on preview / liveMode
      })}
    >
      Drop here!
    </div>
  );
};

export default DropArea;
