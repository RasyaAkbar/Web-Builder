import { defaultStyles, EditorBtns } from "@/lib/constants";
import { Link, Link2Icon, TypeIcon } from "lucide-react";
import React from "react";
import { v4 } from "uuid";

type Props = {};

const LinkPlaceholder = (props: Props) => {
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
            content: {
              innerText: "Link Element",
              href: "#",
            },
            id: v4(),
            name: "Link",
            styles: {
              color: "black",
              ...defaultStyles,
            },
            type: "link",
          })}`
        );
      }}
      className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <Link2Icon size={40} className="text-muted-foreground" />
    </div>
  );
};

export default LinkPlaceholder;
