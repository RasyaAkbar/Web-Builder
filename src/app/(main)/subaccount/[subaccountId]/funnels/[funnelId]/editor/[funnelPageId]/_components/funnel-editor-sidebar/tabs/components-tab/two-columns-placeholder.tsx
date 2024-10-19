import { defaultStyles, EditorBtns } from "@/lib/constants";
import React from "react";
import { v4 } from "uuid";

type Props = {};

const TwoColumnsPlaceholder = (props: Props) => {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    if (type === null) return;
    e.dataTransfer.setData("componentType", type);
  };
  return (
    <div
      draggable
      onDragStart={(e) =>
        handleDragStart(
          e,
          `ADD_ELEMENT*&#^$${JSON.stringify({
            content: [
              {
                content: [],
                id: v4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
              {
                content: [],
                id: v4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
            ],
            id: v4(),
            name: "Two Columns",
            styles: { ...defaultStyles, display: "flex" },
            type: "2Col",
          })}`
        )
      }
      className=" h-14 w-14 bg-muted/70 rounded-lg p-2 flex flex-row gap-[4px]"
    >
      <div className="border-dashed border-[1px] h-full rounded-sm bg-muted border-muted-foreground/50 w-full"></div>
      <div className="border-dashed border-[1px] h-full rounded-sm bg-muted border-muted-foreground/50 w-full"></div>
    </div>
  );
};

export default TwoColumnsPlaceholder;
