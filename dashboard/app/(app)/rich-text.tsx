"use client";

import { useState } from "react";
import {
  defineSchema,
  defineTextBlock,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  type PortableTextBlock,
} from "@portabletext/editor";
import { EventListenerPlugin, NodePlugin } from "@portabletext/editor/plugins";
import {
  isActiveDecorator,
  isActiveListItem,
  isActiveStyle,
} from "@portabletext/editor/selectors";

const schemaDefinition = defineSchema({
  decorators: [{ name: "strong" }, { name: "em" }],
  styles: [{ name: "normal" }, { name: "h3" }, { name: "blockquote" }],
  lists: [{ name: "bullet" }, { name: "number" }],
  annotations: [],
  inlineObjects: [],
  blockObjects: [],
});

/* Module scope on purpose: a fresh array each render would make NodePlugin
   unregister and re-register on every keystroke. */
const nodes = [
  defineTextBlock({
    type: "block",
    render: (props) => {
      /* The editor keeps list items as sibling blocks rather than nesting them
         in a <ul>, so the marker and indent come from CSS off these attrs. */
      if (props.node.listItem) {
        return (
          <div
            {...props.attributes}
            data-list={props.node.listItem}
            data-level={props.node.level ?? 1}
          >
            {props.children}
          </div>
        );
      }
      if (props.node.style === "h3") return <h3 {...props.attributes}>{props.children}</h3>;
      if (props.node.style === "blockquote")
        return <blockquote {...props.attributes}>{props.children}</blockquote>;
      return <div {...props.attributes}>{props.children}</div>;
    },
  }),
];

function BoldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <text
        x="8"
        y="12"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
      >
        B
      </text>
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <text
        x="8"
        y="12"
        textAnchor="middle"
        fontSize="12"
        fontStyle="italic"
        fill="currentColor"
        fontFamily="Georgia, serif"
      >
        I
      </text>
    </svg>
  );
}

function HeadingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <text
        x="8"
        y="12"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
      >
        H
      </text>
    </svg>
  );
}

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
};

function BulletIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="3" cy="4.5" r="1.1" fill="currentColor" />
      <circle cx="3" cy="8" r="1.1" fill="currentColor" />
      <circle cx="3" cy="11.5" r="1.1" fill="currentColor" />
      <path d="M6.5 4.5h7M6.5 8h7M6.5 11.5h7" {...line} />
    </svg>
  );
}

function NumberIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <text x="1" y="6.4" fontSize="5.5" fill="currentColor" fontFamily="system-ui, sans-serif">
        1
      </text>
      <text x="1" y="13.4" fontSize="5.5" fill="currentColor" fontFamily="system-ui, sans-serif">
        2
      </text>
      <path d="M6.5 4.5h7M6.5 11.5h7" {...line} />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 11.5V8.5a3 3 0 0 1 3-3" {...line} />
      <path d="M2.5 8.5h3v3h-3z" fill="currentColor" stroke="none" />
      <path d="M10 11.5V8.5a3 3 0 0 1 3-3" {...line} />
      <path d="M8.5 8.5h3v3h-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={active ? "rt-btn is-on" : "rt-btn"}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function Toolbar() {
  const editor = useEditor();

  const bold = useEditorSelector(editor, isActiveDecorator("strong"));
  const italic = useEditorSelector(editor, isActiveDecorator("em"));
  const heading = useEditorSelector(editor, isActiveStyle("h3"));
  const quote = useEditorSelector(editor, isActiveStyle("blockquote"));
  const bullet = useEditorSelector(editor, isActiveListItem("bullet"));
  const numbered = useEditorSelector(editor, isActiveListItem("number"));

  const decorator = (name: string) => () => {
    editor.send({ type: "decorator.toggle", decorator: name });
    editor.send({ type: "focus" });
  };
  const style = (name: string) => () => {
    editor.send({ type: "style.toggle", style: name });
    editor.send({ type: "focus" });
  };
  const list = (name: string) => () => {
    editor.send({ type: "list item.toggle", listItem: name });
    editor.send({ type: "focus" });
  };

  return (
    <div className="rt-toolbar">
      <ToolbarButton active={bold} label="Bold" onClick={decorator("strong")}>
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton active={italic} label="Italic" onClick={decorator("em")}>
        <ItalicIcon />
      </ToolbarButton>
      <span className="rt-sep" />
      <ToolbarButton active={heading} label="Heading" onClick={style("h3")}>
        <HeadingIcon />
      </ToolbarButton>
      <ToolbarButton active={quote} label="Quote" onClick={style("blockquote")}>
        <QuoteIcon />
      </ToolbarButton>
      <span className="rt-sep" />
      <ToolbarButton active={bullet} label="Bulleted list" onClick={list("bullet")}>
        <BulletIcon />
      </ToolbarButton>
      <ToolbarButton active={numbered} label="Numbered list" onClick={list("number")}>
        <NumberIcon />
      </ToolbarButton>
    </div>
  );
}

/** Writes Portable Text into a hidden input so it rides the normal form POST. */
export function RichText({ name }: { name: string }) {
  const [value, setValue] = useState<PortableTextBlock[] | undefined>(undefined);

  const isEmpty =
    !value ||
    value.length === 0 ||
    value.every(
      (block) =>
        Array.isArray((block as { children?: { text?: string }[] }).children) &&
        (block as { children: { text?: string }[] }).children.every(
          (child) => !child.text?.trim(),
        ),
    );

  return (
    <div className="rt">
      <EditorProvider initialConfig={{ schemaDefinition }}>
        <EventListenerPlugin
          on={(event) => {
            if (event.type === "mutation") setValue(event.value);
          }}
        />
        <NodePlugin nodes={nodes} />
        <Toolbar />
        <PortableTextEditable
          className="rt-editable"
          renderDecorator={(props) => {
            if (props.value === "strong") return <strong>{props.children}</strong>;
            if (props.value === "em") return <em>{props.children}</em>;
            return <>{props.children}</>;
          }}
          renderPlaceholder={() => (
            <span className="rt-placeholder">Write it here.</span>
          )}
        />
      </EditorProvider>
      <input type="hidden" name={name} value={isEmpty ? "" : JSON.stringify(value)} />
    </div>
  );
}
