import * as React from "react";
import {
  Modal,
  styled,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { randomUUID } from "./index.ts";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";
import { basicSetupOptions } from "@/components/snippet-editor";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { xml } from "@codemirror/lang-xml";
import { useAppSelector } from "@/redux/store/hooks.ts";
import { selectFontSize } from "@/redux/features/slide/preview.ts";

type TableData = {
  content: string[][];
};

type ListItems = {
  content: string;
  items: ListItems[];
};
type ListData = {
  items: ListItems[];
  style: "unordered" | "ordered";
};

const LinkContainer = styled("div")({
  width: "calc(100% - 24px)",
  height: "max-content",
  padding: "12px 2rem",
  position: "relative",
  top: 0,
  textAlign: "center",
  backgroundColor: "#EFF9FD",
  a: {
    textAlign: "center",
    textDecoration: "none",
    color: "inherit",
  },
  "a::after": {
    content: '""',
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
});

const StyledReactCodeMirror = styled(ReactCodeMirror)({
  width: "100%",
  maxWidth: "calc(100% - 24px)",
  backgroundColor: "#fefefe",
  "& .show": {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  " & .hide": {
    opacity: 0,
    display: "none",
  },
});

const StyledTableContainer = styled("div")({
  width: "100%",
  display: "grid",
  textAlign: "center",
});

const renderTable = (data: TableData, onClick?: () => void) => {
  return (
    <Table
      sx={{
        borderCollapse: "collapse",
        width: "100%",
        border: "1px solid #e0e0e0",
        borderSpacing: "0",
        tableLayout: "fixed",
      }}
      onClick={() => onClick && onClick()}
    >
      <TableBody
        sx={{
          tr: {
            width: "100%",
            border: "1px solid #0a0a0a",
            padding: 0,
          },
          td: {
            border: "1px solid #0a0a0a",
            wordBreak: "break-all",
          },
        }}
      >
        {data.content.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <TableCell align={"center"} key={cellIndex}>
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
const TableRenderer: React.FC<{
  data: TableData;
}> = ({ data }) => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "24px",
        }}
      >
        {renderTable(data)}
      </Modal>
      <StyledTableContainer>
        {renderTable(data, () => setShowModal(true))}
      </StyledTableContainer>
    </>
  );
};

type ListRendererProps = {
  data: ListData;
};

const ListRenderer: React.FC<ListRendererProps> = ({ data }) => {
  const renderItem = (item: ListItems, index: number) => {
    if (item.items) {
      // Render nested list if it exists
      return (
        <li key={index}>
          {item.content}
          <ul
            style={{
              marginLeft: "1rem",
            }}
          >
            {item.items.map((subItem, subIndex) =>
              renderItem(subItem, subIndex)
            )}
          </ul>
        </li>
      );
    } else {
      // Render regular list item
      return <li key={index}>{item.content}</li>;
    }
  };

  if (data.style === "unordered") {
    return <ul>{data.items.map(renderItem)}</ul>;
  } else if (data.style === "ordered") {
    return <ol>{data.items.map(renderItem)}</ol>;
  } else {
    // For any other list style, just render the items as plain text
    return (
      <ul>
        {data.items.map((item, index) => (
          <li key={index}>{item.content}</li>
        ))}
      </ul>
    );
  }
};

const DelimiterRenderer = (_: any) => {
  return <br />;
};

const CodeMirrorRenderer = (props: any) => {
  const fontSize = useAppSelector(selectFontSize);
  const id = randomUUID();
  // console.log(props.data, "Got Data");
  const selectExtension = (language: string) => {
    switch (language) {
      case "json":
        return json();
      case "html":
        return html({});
      case "css":
        return css();
      case "javascript":
        return javascript({
          jsx: true,
          typescript: true,
        });
      case "xml":
        return xml();
      case "markdown":
        return markdown({});
      default:
        return html({});
    }
  };

  return (
    <StyledReactCodeMirror
      sx={{
        fontSize,
      }}
      value={props.data.code}
      id={`editor-js-${id}`}
      maxHeight={"500px"}
      readOnly={true}
      basicSetup={basicSetupOptions}
      defaultValue={props.data.code}
      extensions={[
        basicSetup(basicSetupOptions),
        selectExtension(props.data.language.toLowerCase()),
      ]}
    ></StyledReactCodeMirror>
  );
};

const LinkToolRenderer = (e: any) => {
  // console.log(e);
  return (
    <LinkContainer>
      <a href={e.data.link}>{e.data.link}</a>
    </LinkContainer>
  );
};

const ImageToolRenderer = (e: any) => {
  console.log(e);
  return <div>Hey Image</div>;
};

export {
  TableRenderer,
  ListRenderer,
  DelimiterRenderer,
  CodeMirrorRenderer,
  LinkToolRenderer,
  ImageToolRenderer,
};
