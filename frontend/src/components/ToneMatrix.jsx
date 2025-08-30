import React, { useState, useEffect, useRef, useCallback } from "react";

const CELLS = [
  { id: "formal-concise",   formality: "formal",   verbosity: "concise",   x: 0, y: 0, label: "Formal Concise" },
  { id: "formal-balanced",  formality: "formal",   verbosity: "balanced",  x: 1, y: 0, label: "Formal Balanced" },
  { id: "formal-elaborate", formality: "formal",   verbosity: "elaborate", x: 2, y: 0, label: "Formal Elaborate" },

  { id: "neutral-concise",   formality: "neutral", verbosity: "concise",   x: 0, y: 1, label: "Neutral Concise" },
  { id: "neutral-balanced",  formality: "neutral", verbosity: "balanced",  x: 1, y: 1, label: "Reset" }, // ⬅️ treat as reset
  { id: "neutral-elaborate", formality: "neutral", verbosity: "elaborate", x: 2, y: 1, label: "Neutral Elaborate" },

  { id: "casual-concise",   formality: "casual",   verbosity: "concise",   x: 0, y: 2, label: "Casual Concise" },
  { id: "casual-balanced",  formality: "casual",   verbosity: "balanced",  x: 1, y: 2, label: "Casual Balanced" },
  { id: "casual-elaborate", formality: "casual",   verbosity: "elaborate", x: 2, y: 2, label: "Casual Elaborate" },
];

function getCell(xPct, yPct) {
  const idx = (val) => Math.min(2, Math.floor(val / (100 / 3)));
  return { row: idx(yPct), col: idx(xPct) };
}

function snapToCell(xPct, yPct) {
  const { row, col } = getCell(xPct, yPct);
  return CELLS.find((c) => c.x === col && c.y === row);
}

function getCellCenter(x, y) {
  const centers = [16.67, 50, 83.33]; // %
  return { x: centers[x], y: centers[y] };
}

export default function ToneMatrix({ onPick, disabled, activeId }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // start center
  const [isDragging, setIsDragging] = useState(false);

  // Sync pointer when external active tone changes
  useEffect(() => {
    if (activeId) {
      const cell = CELLS.find((c) => c.id === activeId);
      if (cell) setPosition(getCellCenter(cell.x, cell.y));
    } else {
      // Reset pointer to center when reset clears activeId
      setPosition({ x: 50, y: 50 });
    }
  }, [activeId]);

  const updatePosition = useCallback((clientX, clientY) => {
    const rect = ref.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
    setPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const commit = useCallback(() => {
    if (disabled) return;
    const cell = snapToCell(position.x, position.y);
    if (!cell) return;

    if (cell.id === "neutral-balanced") {
      onPick({ id: "reset" });
      setPosition({ x: 50, y: 50 });
      setIsDragging(false);
      return;
    }

    // Map neutral/balanced → fallback values if backend doesn’t support them
    const apiFormality = cell.formality === "neutral" ? "casual" : cell.formality;
    const apiVerbosity = cell.verbosity === "balanced" ? "concise" : cell.verbosity;

    onPick({ ...cell, formality: apiFormality, verbosity: apiVerbosity });
    setPosition(getCellCenter(cell.x, cell.y));
    setIsDragging(false);
  }, [position, onPick, disabled]);

  // Mouse/touch events
  const onDown = (e) => { if (!disabled) { setIsDragging(true); updatePosition(e.clientX, e.clientY); } };
  const onMove = (e) => { if (isDragging) updatePosition(e.clientX, e.clientY); };
  const onUp = () => { if (isDragging) commit(); };

  const onTouchStart = (e) => { if (!disabled) { setIsDragging(true); updatePosition(e.touches[0].clientX, e.touches[0].clientY); } };
  const onTouchMove = (e) => { if (isDragging && e.touches[0]) { updatePosition(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); } };
  const onTouchEnd = () => { if (isDragging) commit(); };

  const currentCell = snapToCell(position.x, position.y);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium text-gray-700">Tone Matrix (3×3)</div>

      <div
        ref={ref}
        className={[
          "relative w-full h-72 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100",
          "border border-gray-300 shadow-inner overflow-hidden select-none",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-crosshair",
        ].join(" ")}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {CELLS.map((c) => {
            const isActive = activeId === c.id;
            const isCurrent = currentCell?.id === c.id;
            return (
              <div
                key={c.id}
                className={[
                  "border border-gray-200 transition-colors",
                  isActive ? "bg-indigo-100/70" : isCurrent ? "bg-indigo-50/50" : "",
                ].join(" ")}
              />
            );
          })}
        </div>

        {/* Labels */}
        <div className="absolute inset-0 pointer-events-none text-[10px] font-medium">
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-gray-600">Formal</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-600">Casual</span>
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-600">Concise</span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-600">Elaborate</span>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500">Reset</span>
        </div>

        {/* Pointer */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out pointer-events-none"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500 shadow-lg ring-4 ring-indigo-200" />
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Drag • Release to snap • Center = Reset
      </div>
    </div>
  );
}
