import { Group, Rect, Text } from "react-konva";
import { Html } from "react-konva-utils";
import Konva from "konva";
import {
  useEffect,
  useRef,
  useState,
  type Ref,
  type KeyboardEvent,
  useCallback,
} from "react";
import { type TextShape } from "../types";
import type { Scale } from "../hooks/useScale";
import useScale from "../hooks/useScale";
import { useAppStore } from "../store/store";

type TextEditorProps = {
  shape: TextShape;
  onChange: (value: string) => void;
  onClose: () => void;
};

const TextEditor = ({ shape, onClose, onChange }: TextEditorProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const scale = useScale();

  let transform = "";
  if (shape.rotation) {
    transform += `rotateZ(${shape.rotation}deg)`;
  }

  const handleClose = useCallback(() => {
    textAreaRef.current?.blur();
    onClose();
  }, [onClose]);

  useEffect(() => {
    textAreaRef.current?.focus();
    textAreaRef.current?.select();

    const handleClick = (event: MouseEvent) => {
      if (
        textAreaRef.current &&
        !textAreaRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    setTimeout(() => {
      document.addEventListener("mousedown", handleClick, true);
    });

    return () => {
      document.removeEventListener("mousedown", handleClick, true);
    };
  }, [shape, handleClose]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onChange(e.currentTarget.value);
      handleClose();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Html>
      <textarea
        ref={textAreaRef}
        value={shape.text}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        style={{
          minHeight: "1em",
          position: "absolute",
          border: "none",
          outline: "none",
          boxShadow: "none",
          resize: "none",
          width: `${shape.width * scale.WidthToA4}px`,
          height: `${shape.height * scale.WidthToA4}px`,
          fontSize: `${shape.fontSize * scale.WidthToA4}px`,
          padding: "0px",
          margin: "0px",
          overflow: "hidden",
          background: "none",
          lineHeight: `${shape.lineHeight}`,
          fontFamily: shape.fontFamily,
          transformOrigin: "left top",
          transform: transform,
          color: shape.fontColor,
        }}
      />
    </Html>
  );
};

type TextElementProps = {
  ref: Ref<Konva.Group>;
  text: TextShape;
  onTransformEnd?: (
    evt: Konva.KonvaEventObject<Event>,
    id: string,
    scale: Scale,
  ) => void;
  onDragEnd?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
};

function TextElement({
  ref,
  text,
  onDragEnd,
  onTransformEnd,
}: TextElementProps) {
  const onStyleChange = useAppStore.use.styleById();
  const handleMouseDown = useAppStore.use.handleMouseDown();
  const handleDragEnd = useAppStore.use.handleDragEnd();

  const [isEditing, setIsEditing] = useState(true);

  const scale = useScale();

  const x = text.x * scale.WidthToA4;
  const y = text.y * scale.WidthToA4;

  const width = text.width * scale.WidthToA4;
  const height = text.height * scale.WidthToA4;

  const letterSpacing =
    text.letterSpacing === undefined
      ? undefined
      : text.letterSpacing * scale.WidthToA4;
  const fontSize = text.fontSize * scale.WidthToA4;

  const handleTextChange = (value: string) => {
    onStyleChange(text.id, "text", value);
  };

  return (
    <Group
      ref={ref}
      x={x}
      y={y}
      draggable
      id={text.id}
      name={text.name}
      onTransform={(e) => onTransformEnd?.(e, text.id, scale)}
      onDragEnd={(e) => {
        handleDragEnd(e, text.id, scale);
        onDragEnd?.(e);
      }}
      onMouseDown={(evt) => {
        handleMouseDown(evt, text.id);
      }}
      onDblClick={() => {
        setIsEditing(true);
      }}
    >
      <Rect width={width} height={height} />
      <Text
        text={text.text}
        fontFamily={text.fontFamily}
        fontStyle={text.fontStyle}
        fill={text.fontColor}
        lineHeight={text.lineHeight}
        fontSize={fontSize}
        letterSpacing={letterSpacing}
        width={width}
        height={height}
        visible={!isEditing}
      />
      {isEditing && (
        <TextEditor
          shape={text}
          onChange={handleTextChange}
          onClose={() => setIsEditing(false)}
        />
      )}
    </Group>
  );
}

export default TextElement;
