import { EditorBtns } from "@/lib/constants";
import { TypeIcon, VideoIcon, Youtube } from "lucide-react";
import React from "react";
import { v4 } from "uuid";

type Props = {};

const VideoPlaceholder = (props: Props) => {
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
              src: "https://www.youtube.com/embed/A3l6YYkXzzg?si=zbcCeWcpq7Cwf8W1",
            },
            id: v4(),
            name: "Video",
            styles: {},
            type: "video",
          })}`
        );
      }}
      className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <Youtube size={40} className="text-muted-foreground" />
    </div>
  );
};

export default VideoPlaceholder;
