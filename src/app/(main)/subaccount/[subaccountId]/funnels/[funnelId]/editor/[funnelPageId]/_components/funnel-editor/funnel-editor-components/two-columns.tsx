"use client";
import {
  changeId,
  EditorElement,
  useEditor,
} from "@/providers/editor/editor-provider";
import React, { useEffect, useState } from "react";
import Recursive from "./recursive";
import DropArea from "./drop-area";
import { v4 } from "uuid";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { EditorBtns, defaultStyles } from "@/lib/constants";
import { Action } from "@/lib/types";
import { Clipboard, ClipboardCheck, Trash } from "lucide-react";
import { isDescendant } from "@/lib/utils";

type Props = {
  element: EditorElement;
};/*
<div>
  <Recursive />
</div>*/
const TwoColumns = (props: Props) => {
  const { id, content, type } = props.element;
  const { dispatch, state } = useEditor();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      e.stopPropagation();

      // Detect Ctrl+C (or Cmd+C on macOS)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.stopPropagation();
        // Set your custom object

        if (state.editor.selectedElement.id == id && id !== "__body") {
          dispatch({
            type: "COPY_ELEMENT",
            payload: {
              elementDetails: changeId(props.element),
            },
          });
        }
      }
      // Detect Ctrl+V (or Cmd+V on macOS)
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        //e.preventDefault(); // Prevent the default paste behavior
        e.stopPropagation();
        if (
          state.editor.copiedElement.type !== null &&
          state.editor.selectedElement.id == id
        ) {
          // Use the pasted object
          dispatch({
            type: "PASTE_ELEMENT",
            payload: {
              containerId: state.editor.selectedElement.id,
            },
          });
        }
      }
      if (!isInputField) {
        if (e.key === "Backspace" || e.key === "Delete") {
          //e.preventDefault(); // Prevent the default delete behavior
          e.stopPropagation();
          if (state.editor.selectedElement.id == id && id !== "__body") {
            dispatch({
              type: "DELETE_ELEMENT",
              payload: {
                elementDetails: props.element,
              },
            });
          }
        }
    }
    };
    // Add the keydown event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.editor.selectedElement]); // Dependency on copiedObject ensures that the latest object is always used


  const handleCopy = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent the default copy behavior

    // Set your custom object
    if (state.editor.selectedElement.id == id && id !== "__body") {
      dispatch({
        type: "COPY_ELEMENT",
        payload: {
          elementDetails: changeId(props.element),
        },
      });
    }
    setIsCopied(true);
    // Revert back to the clipboard icon after 1.5 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  const handleOnDrop = (e: React.DragEvent, type: string) => {
    e.stopPropagation();
    const componentType = e.dataTransfer
      .getData("componentType")
      .split("*&#^$");
    
    const component = JSON.parse(componentType[1])

    switch (componentType[0] as Action) {
      case "MOVE_ELEMENT":
        if((Array.isArray(component.content) && !isDescendant(id, component) && id !==component.id) || !Array.isArray(component.content) ){
        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            containerId: id,
            elementDetails: component,
          },
        });
      }
        break;
      case "ADD_ELEMENT":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: id,
            elementDetails: component,
          },
        });
        break;
      
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDragStart = (e: React.DragEvent, type: string) => {
    if (type === "__body" || type == null) return;
    e.stopPropagation();
    e.dataTransfer.setData("componentType", type);
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  return (
    <div
      style={props.element.styles}
      className={clsx("relative p-4 transition-all", {
        "h-fit": type === "container",
        "h-full": type === "__body",
        "m-4": type === "container",
        "!border-blue-500":
          state.editor.selectedElement.id === props.element.id &&
          !state.editor.liveMode,
        "!border-solid":
          state.editor.selectedElement.id === props.element.id &&
          !state.editor.liveMode,
        "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
      })}
      id="innerContainer"
      onDrop={(e) => handleOnDrop(e, id)}
      onDragOver={handleDragOver}
      draggable={type !== "__body" && !state.editor.liveMode}
      onClick={handleOnClickBody}
      onDragStart={(e) =>
        handleDragStart(e, `MOVE_ELEMENT*&#^$${JSON.stringify(props.element)}`)
      }
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      {<DropArea container={props.element} index={0} />}
      {Array.isArray(content) &&
        content.map((childElement, index) => (
          <>
            <Recursive key={childElement.id} element={childElement} />
            {<DropArea container={props.element} index={index + 1} />}
          </>
        ))}

      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode &&
        state.editor.selectedElement.type !== "__body" && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] right-[35px] rounded-none rounded-t-lg ">
            {isCopied ? (
              <ClipboardCheck size={16} />
            ) : (
              <Clipboard size={16} onClick={handleCopy} />
            )}
          </div>
        )}
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode &&
        state.editor.selectedElement.type !== "__body" && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg ">
            <Trash size={16} onClick={handleDeleteElement} />
          </div>
        )}
    </div>
  );
};

export default TwoColumns;
