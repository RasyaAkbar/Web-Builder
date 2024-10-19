import { EditorBtns } from "@/lib/constants";
import { Action } from "@/lib/types";
import { EditorElement } from "@/providers/editor/editor-provider";
import {
  Contact2Icon,
  Link,
  Link2Icon,
  ShoppingCartIcon,
  TypeIcon,
} from "lucide-react";
import React from "react";
import { v4 } from "uuid";

type Props = {};

const ContactFormComponentPlaceholder = (props: Props) => {
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
            content: [],
            id: v4(),
            name: "Contact Form",
            styles: {},
            type: "contactForm",
          })}`
        );
      }}
      className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <Contact2Icon size={40} className="text-muted-foreground" />
    </div>
  );
};

export default ContactFormComponentPlaceholder;
