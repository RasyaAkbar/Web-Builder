"use client";
import { Badge } from "@/components/ui/badge";
import { EditorBtns } from "@/lib/constants";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Clipboard, ClipboardCheck, Trash } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { v4 } from "uuid";

type Props = {
  element: EditorElement;
};

const ImageComponent = (props: Props) => {
  const { dispatch, state } = useEditor();
  const styles = props.element.styles;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent the default copy behavior
    if (state.editor.selectedElement.id == props.element.id) {
      dispatch({
        type: "COPY_ELEMENT",
        payload: {
          elementDetails: {
            ...props.element,
            id: v4(),
          },
        },
      });
    }
    setIsCopied(true);
    // Revert back to the clipboard icon after 1.5 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      e.stopPropagation();
      if (!isInputField) {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        // Prevent the default copy behavior
        e.stopPropagation();
        // Set your custom object
        
        if (state.editor.selectedElement.id == props.element.id) {
          dispatch({
            type: "COPY_ELEMENT",
            payload: {
              elementDetails: {
                ...props.element,
                id: v4(),
              },
            },
          });
        }
      }

      
        if (e.key === "Backspace" || e.key === "Delete") {
          //e.preventDefault(); // Prevent the default delete behavior
          //e.stopPropagation()
          if (state.editor.selectedElement.id == props.element.id) {
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

    // Add the copy event listener when the component mounts
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.editor.selectedElement]); // Dependency on copiedObject ensures that the latest object is always used

  const handleDragStart = (e: React.DragEvent, type: string) => {
    if (type === null) return;
    e.stopPropagation();
    e.dataTransfer.setData("componentType", type);
  };

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: props.element },
    });
  };

  return (
    <div
      style={styles}
      draggable={!state.editor.liveMode}
      onDragStart={(e) =>
        handleDragStart(e, `MOVE_ELEMENT*&#^$${JSON.stringify(props.element)}`)
      }
      onClick={handleOnClick}
      className={clsx(
        "p-[2px] w-full m-[5px] relative text-[16px] transition-all flex items-center justify-center",
        {
          "!border-blue-500":
            state.editor.selectedElement.id === props.element.id,
          "!border-solid": state.editor.selectedElement.id === props.element.id,
          "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      {!Array.isArray(props.element.content) && (
        <img
          width={props.element.styles.width || '100'}
          height={props.element.styles.height || '100'}
          src={props.element.content.src || ""}
          alt="preview image"
          style={props.element.styles}
          className=""
        />
      )}

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
        !state.editor.liveMode && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </div>
  );
};

export default ImageComponent;
