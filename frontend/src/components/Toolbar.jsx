import * as React from "react";
import { Tooltip } from "radix-ui";
import { RotateCcw, RotateCw, RefreshCcw, Sparkles } from "lucide-react";

const IconBtn = ({ title, onClick, disabled, children }) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm shadow-sm hover:shadow disabled:opacity-60 inline-flex items-center gap-2"
          onClick={onClick}
          disabled={disabled}
          type="button"
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={8}
          className="rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow"
        >
          {title}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default function Toolbar({
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  disabled,
  onApplyLast,
  hasLastTone,
}) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex flex-wrap gap-2">
        <IconBtn
          title="Undo (Ctrl/Cmd+Z)"
          onClick={onUndo}
          disabled={!canUndo || disabled}
        >
          <RotateCcw size={16} /> Undo
        </IconBtn>

        <IconBtn
          title="Redo (Shift+Ctrl/Cmd+Z or Ctrl+Y)"
          onClick={onRedo}
          disabled={!canRedo || disabled}
        >
          <RotateCw size={16} /> Redo
        </IconBtn>

        <IconBtn title="Reset (Esc)" onClick={onReset} disabled={disabled}>
          <RefreshCcw size={16} /> Reset
        </IconBtn>

        <IconBtn
          title="Apply last tone (Ctrl/Cmd+Enter)"
          onClick={onApplyLast}
          disabled={!hasLastTone || disabled}
        >
          <Sparkles size={16} /> Apply Last
        </IconBtn>
      </div>
    </Tooltip.Provider>
  );
}
