"use client";
import { Button } from "@/components/ui/button";
import { getFunnelPageDetails } from "@/lib/queries";
import { useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { EyeOff } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import Recursive from "./funnel-editor-components/recursive";

type Props = { funnelPageId: string; liveMode?: boolean; initialData?: any };

const FunnelEditor = ({ funnelPageId, liveMode, initialData }: Props) => {
  const { dispatch, state } = useEditor();
  useEffect(() => {
    if (liveMode) {
      dispatch({
        type: "TOGGLE_LIVE_MODE",
        payload: { value: true },
      });
    }
  }, [liveMode]);

  //CHALLENGE: make this more performant
  useEffect(() => {
    const fetchData = async () => {
      if (!!initialData) {
        dispatch({
          type: "LOAD_DATA",
          payload: {
            elements: initialData ? initialData : "",
            withLive: !!liveMode,
          },
        });
      } else {
        const response = await getFunnelPageDetails(funnelPageId);
        if (!response) return;

        dispatch({
          type: "LOAD_DATA",
          payload: {
            elements: response.content ? JSON.parse(response?.content) : "",
            withLive: !!liveMode,
          },
        });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (state.history.currentIndex > 0) dispatch({ type: "UNDO" });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        if (state.history.currentIndex < state.history.history.length - 1)
          dispatch({ type: "REDO" });
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.history.currentIndex]);

  const handleClick = () => {
    // if you click the body element it will not select any element (click off)
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {},
    });
  };

  const handleUnpreview = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  const components = useMemo(
    () =>
      state.editor.elements.map((childElement) => (
        <Recursive key={childElement.id} element={childElement} />
      )),
    [state.editor.elements]
  );

  return (
    <div
      className={clsx(
        "use-automation-zoom-in h-screen max-h-screen overflow-scroll mr-[385px] bg-background transition-all rounded-md",
        {
          "!p-0 !mr-0":
            state.editor.previewMode === true || state.editor.liveMode === true || !state.editor.openSidebar,
          "!w-[850px]": state.editor.device === "Tablet",
          "!w-[420px]": state.editor.device === "Mobile",
          "w-full": state.editor.device === "Desktop",
        }
      )}
      onClick={handleClick}
    >
      {state.editor.previewMode &&
        state.editor.liveMode && ( // if only livemode, the eyeoff will not be present
          <Button
            variant={"ghost"}
            size={"icon"}
            className="w-6 h-6 bg-slate-600 p-[2px] fixed top-0 left-0 z-[100]"
            onClick={handleUnpreview}
          >
            <EyeOff />
          </Button>
        )}
      {
        /*Array.isArray(state.editor.elements) &&
        state.editor.elements.map((childElement) => (
          <Recursive
            key={childElement.id}
            element={childElement}
          />
        ))*/ components
      }
    </div>
  );
};

export default FunnelEditor;
