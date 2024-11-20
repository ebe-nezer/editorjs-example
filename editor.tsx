import * as React from "react";
import { EditorCore } from "@react-editor-js/core";
import { styled } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks.ts";
import {
  selectCurrentInstruction,
  selectCurrentInstructionId,
  selectCurrentSlideID,
  updateInstruction,
} from "@/redux/features/slide";
import { INSTRUCTION_TOOLS } from "@/page/editor/slide/tools/editor-tools.js";
import EditorJS, { API } from "@editorjs/editorjs";

const ReactEditor = styled("div")({
  margin: "0px auto",
  "&": {
    width: "90%",
    "*": {
      fontFamily: "Lato",
    },
  },
  "& .codex-editor__redactor": {
    width: "100%",
    paddingBottom: "0px !important",
  },
});

const SlideInstruction = () => {
  const dispatch = useAppDispatch();
  const editorRef = React.useRef<EditorCore | null>(null);
  const currentSlide = useAppSelector(selectCurrentSlideID);
  const currentInstruction = useAppSelector(selectCurrentInstruction);
  const currentInstructionId = useAppSelector(selectCurrentInstructionId);
  const outerDivRef = React.useRef<HTMLDivElement | null>(null);
  const handleInitialize = React.useCallback(
    async (instance: EditorCore) => {
      // Do something with the editor instance if needed
      if (currentInstruction) await instance.render(currentInstruction);

      editorRef.current = instance;
    },
    [currentInstruction]
  );

  const handleSave = React.useCallback(async () => {
    if (editorRef.current) {
      const savedData = await editorRef.current?.save();
      dispatch(updateInstruction(savedData));
    }
  }, [dispatch, editorRef]);

  React.useEffect(() => {
    const editorConfig = {
      holder: "editorjs-react-component",
      tools: INSTRUCTION_TOOLS,
      data: currentInstruction,
      onChange: async (api: API) => {
        // console.log({ ...currentInstruction, ...(await api.saver.save()) });
        dispatch(updateInstruction(await api.saver.save()));
      },
      autofocus: true,
      placeholder: "Write something...",
      hideToolbar: false,
      onReady: () => console.log("Start"),
      onInitialize: handleInitialize,
      defaultValue: currentInstruction,
    };

    const editor = new EditorJS(editorConfig);

    editor.isReady
      .then(() => {
        editor.on("onRemove", (blockId) => {
          const block = editor.blocks.getBlockByIndex(blockId);
          console.log("Block with ID " + blockId + " was removed");
          console.log("Block content: " + block);
        });
      })
      .catch((err) => console.log(err));
    window.addEventListener("keydown", (e) => handleKey(e));
    return () => window.removeEventListener("keydown", (e) => handleKey(e));
  }, [currentInstructionId]);

  const handleKey = async (event: KeyboardEvent) => {
    if (event.ctrlKey && (event.key === "s" || event.key === "S")) {
      event.preventDefault();
      await handleSave();
    }
  };

  return (
    <InstructionContainer key={currentSlide}>
      <Wrapper ref={outerDivRef}>
        <ReactEditor
          id={"editorjs-react-component"}
          sx={{
            "&": {
              width: `calc(${outerDivRef.current?.clientWidth}px - 10%) !important})`,
            },
          }}
        />
      </Wrapper>
    </InstructionContainer>
  );
};
export default SlideInstruction;

const InstructionContainer = styled("div")({
  width: "100%",
  height: "100%",
  overflowY: "scroll",
  padding: "12px",
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "1fr",
  gridColumn: "1 / - 1",
  '& div[id^="react"]': {
    width: "90% !important",
  },
  ".ce-paragraph": {
    fontSize: "36px",
  },
  ".cdx-block": {
    padding: 0,
  },
  ".tc-table": {
    fontSize: "36px",
  },
  "*": {
    maxWidth: "100% !important",
  },
});

const Wrapper = styled("div")({
  width: "calc(100% - 24px)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: "auto auto",
});
