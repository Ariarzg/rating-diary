"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps extends React.ComponentProps<"textarea"> {
  minRows?: number;
}

export function AutoResizeTextarea({
  className,
  minRows = 3,
  value,
  onChange,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
    const minHeight = minRows * lineHeight;
    textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
  }

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        adjustHeight();
      }}
      className={cn("resize-none overflow-hidden", className)}
      rows={minRows}
      {...props}
    />
  );
}
