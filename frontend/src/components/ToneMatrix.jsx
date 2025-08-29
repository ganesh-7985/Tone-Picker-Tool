import * as Tooltip from '@radix-ui/react-tooltip';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CELLS = [
  { id: 'formal-concise',   formality: 'formal', verbosity: 'concise',   x: 0, y: 0, label: 'Formal / Concise' },
  { id: 'formal-elaborate', formality: 'formal', verbosity: 'elaborate', x: 1, y: 0, label: 'Formal / Elaborate' },
  { id: 'casual-concise',   formality: 'casual', verbosity: 'concise',   x: 0, y: 1, label: 'Casual / Concise' },
  { id: 'casual-elaborate', formality: 'casual', verbosity: 'elaborate', x: 1, y: 1, label: 'Casual / Elaborate' }
];

function snapToCell(px, py) {
  const x = px < 0.5 ? 0 : 1;
  const y = py < 0.5 ? 0 : 1;
  return CELLS.find(c => c.x === x && c.y === y);
}

export default function ToneMatrix({ onPick, disabled, activeId }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0.25, y: 0.25 }); 
  const [isDragging, setIsDragging] = useState(false);
  const activeCell = useMemo(() => CELLS.find(c => c.id === activeId) || null, [activeId]);

  useEffect(() => {
    if (activeCell) setPos({ x: activeCell.x ? 0.75 : 0.25, y: activeCell.y ? 0.75 : 0.25 });
  }, [activeCell?.id]);

  const onPointer = useCallback((e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setPos({ x: px, y: py });
  }, [disabled]);

  const commit = useCallback(() => {
    if (disabled) return;
    const cell = snapToCell(pos.x, pos.y);
    onPick({ ...cell });
    setIsDragging(false);
  }, [pos, onPick, disabled]);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium pb-4 text-gray-700">Tone Picker</div>
      <div className="relative">
        {/* Axis labels */}
        <div className="absolute inset-x-0 -top-6 text-xs text-gray-500 font-medium">
          <div className="flex justify-between px-12">
            <span>Concise</span>
            <span>Elaborate</span>
          </div>
        </div>
        <div className="absolute -left-10 inset-y-0 flex items-center">
          <div className="text-xs text-gray-500 font-medium -rotate-90 whitespace-nowrap">
            <span className="inline-block">Formal ← → Casual</span>
          </div>
        </div>

        {/* Matrix */}
        <div
          ref={ref}
          role="slider"
          aria-label="Tone matrix"
          tabIndex={0}
          onPointerDown={(e) => { 
            e.target.setPointerCapture?.(e.pointerId); 
            onPointer(e); 
            setIsDragging(true);
          }}
          onPointerMove={onPointer}
          onPointerUp={commit}
          onPointerCancel={() => setIsDragging(false)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (['Enter', ' '].includes(e.key)) { commit(); e.preventDefault(); }
            // Arrow key navigation
            const step = 0.5;
            if (e.key === 'ArrowLeft') setPos(p => ({ ...p, x: Math.max(0, p.x - step) }));
            if (e.key === 'ArrowRight') setPos(p => ({ ...p, x: Math.min(1, p.x + step) }));
            if (e.key === 'ArrowUp') setPos(p => ({ ...p, y: Math.max(0, p.y - step) }));
            if (e.key === 'ArrowDown') setPos(p => ({ ...p, y: Math.min(1, p.y + step) }));
          }}
          className={[
            'relative h-56 rounded-xl border-2 bg-white shadow-sm transition-all',
            'cursor-move select-none',
            disabled ? 'opacity-60 cursor-not-allowed border-gray-200' : 'border-gray-300 hover:border-gray-400',
            isDragging ? 'ring-4 ring-indigo-100 border-indigo-400' : ''
          ].join(' ')}
          style={{
            background: `
              linear-gradient(to right, #f9fafb 0%, #f3f4f6 100%),
              linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.02) 50%),
              linear-gradient(to right, transparent 50%, rgba(0,0,0,0.02) 50%)
            `,
            backgroundSize: '100% 100%, 100% 2px, 2px 100%',
            backgroundPosition: '0 0, 0 50%, 50% 0'
          }}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
          </div>

          {/* Gradient overlay */}
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity"
            style={{ 
              background: `radial-gradient(150px circle at ${pos.x * 100}% ${pos.y * 100}%, rgba(99,102,241,0.15), transparent)`,
              opacity: isDragging ? 1 : 0.5
            }} 
          />

          {/* Thumb */}
          <Tooltip.Root open={isDragging}>
            <Tooltip.Trigger asChild>
              <div
                className={[
                  'absolute -translate-x-1/2 -translate-y-1/2 size-8 rounded-full',
                  'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg',
                  'ring-4 ring-white border-2 border-indigo-600',
                  'transition-transform',
                  isDragging ? 'scale-110' : 'hover:scale-105'
                ].join(' ')}
                style={{ 
                  left: `${pos.x * 100}%`, 
                  top: `${pos.y * 100}%`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 4px rgba(255, 255, 255, 1)'
                }}
                aria-hidden="true"
              >
                <div className="absolute inset-1 rounded-full bg-white opacity-30" />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="top" sideOffset={12}
                className="rounded-lg bg-gray-900 text-white text-xs px-3 py-1.5 shadow-lg z-50">
                {snapToCell(pos.x, pos.y).label}
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Quadrant labels */}
          {CELLS.map(c => (
            <div key={c.id}
              className={[
                'absolute text-xs px-2 py-1 rounded-md transition-all',
                activeId === c.id 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 font-medium shadow-sm' 
                  : 'text-gray-600 bg-white/80 border border-gray-200'
              ].join(' ')}
              style={{ 
                left: c.x ? 'auto' : '8px',
                right: c.x ? '8px' : 'auto',
                top: c.y ? 'auto' : '8px',
                bottom: c.y ? '8px' : 'auto'
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Drag the picker to select tone • Press Enter to apply
      </div>
    </div>
  );
}