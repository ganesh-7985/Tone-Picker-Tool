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
  }, [pos, onPick, disabled]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">Tone Picker</div>
      <div
        ref={ref}
        role="slider"
        aria-label="Tone matrix"
        tabIndex={0}
        onPointerDown={(e) => { e.target.setPointerCapture?.(e.pointerId); onPointer(e); }}
        onPointerMove={onPointer}
        onPointerUp={commit}
        onKeyDown={(e) => {
          if (disabled) return;
          if (['Enter', ' '].includes(e.key)) { commit(); e.preventDefault(); }
        }}
        className={[
          'relative h-48 rounded-xl border border-gray-200 bg-white shadow-sm',
          'bg-grid bg-[length:calc(50%_+_1px)_calc(50%_+_1px)]',
          disabled ? 'opacity-60' : ''
        ].join(' ')}
      >
        {/* axis labels */}
        <div className="absolute inset-x-0 -top-5 text-[11px] text-gray-500 text-center">Concise ↔ Elaborate</div>
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] text-gray-500">Formal ↕ Casual</div>

        {/* gradient hint */}
        <div className="absolute inset-0 rounded-xl pointer-events-none"
             style={{ background: 'radial-gradient(120px circle at center, rgba(99,102,241,0.08), transparent)' }} />

        {/* thumb */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div
              className={[
                'absolute -translate-x-1/2 -translate-y-1/2 size-6 rounded-full',
                'bg-indigo-600 shadow-lg ring-4 ring-indigo-100'
              ].join(' ')}
              style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
              aria-hidden="true"
            />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={6}
              className="rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow">
              {snapToCell(pos.x, pos.y).label}
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* quadrant labels */}
        {CELLS.map(c => (
          <div key={c.id}
            className={[
              'absolute text-[11px] text-gray-600 px-1 py-0.5 rounded-md',
              activeId === c.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : ''
            ].join(' ')}
            style={{ left: c.x ? 'calc(100% - 6px)' : '6px', top: c.y ? 'calc(100% - 14px)' : '6px', transform: c.x ? 'translateX(-100%)' : 'none' }}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
