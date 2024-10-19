import { defaultStyles, EditorBtns } from "@/lib/constants";
import { EditorElement } from "@/providers/editor/editor-provider";
import { TypeIcon } from "lucide-react";
import React from "react";
import { v4 } from "uuid";

type Props = {};

const TextPlaceholder = (props: Props) => {
  //Draggable from sidebar to editor
  //Functionalities will be implemented in editor components
  const handleDragState = (e: React.DragEvent, type: string) => {
    if (type === null) return;
    e.dataTransfer.setData("componentType", type);
  };
  return (
    <div
      draggable
      onDragStart={(e) => {
        handleDragState(
          e,
          `ADD_ELEMENT*&#^$${JSON.stringify({
            content: { innerText: "Text Element" },
            id: v4(),
            name: "Text",
            styles: {
              color: "black",
              ...defaultStyles,
            },
            type: "text",
          })}`
        );
      }}
      className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <TypeIcon size={40} className="text-muted-foreground" />
    </div>
  );
};

export default TextPlaceholder;
