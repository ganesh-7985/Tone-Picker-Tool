import * as Tooltip from '@radix-ui/react-tooltip';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CELLS = [
  // Row 1 - Formal
  { id: 'formal-concise',   formality: 'formal', verbosity: 'concise',   x: 0, y: 0, label: 'Formal Concise' },
  { id: 'formal-balanced',  formality: 'formal', verbosity: 'balanced',  x: 1, y: 0, label: 'Formal Balanced' },
  { id: 'formal-elaborate', formality: 'formal', verbosity: 'elaborate', x: 2, y: 0, label: 'Formal Elaborate' },
  
  // Row 2 - Neutral
  { id: 'neutral-concise',   formality: 'neutral', verbosity: 'concise',   x: 0, y: 1, label: 'Neutral Concise' },
  { id: 'neutral-balanced',  formality: 'neutral', verbosity: 'balanced',  x: 1, y: 1, label: 'Neutral Balanced' },
  { id: 'neutral-elaborate', formality: 'neutral', verbosity: 'elaborate', x: 2, y: 1, label: 'Neutral Elaborate' },
  
  // Row 3 - Casual
  { id: 'casual-concise',   formality: 'casual', verbosity: 'concise',   x: 0, y: 2, label: 'Casual Concise' },
  { id: 'casual-balanced',  formality: 'casual', verbosity: 'balanced',  x: 1, y: 2, label: 'Casual Balanced' },
  { id: 'casual-elaborate', formality: 'casual', verbosity: 'elaborate', x: 2, y: 2, label: 'Casual Elaborate' }
];

function snapToCell(px, py) {
  const x = px < 0.33 ? 0 : px < 0.67 ? 1 : 2;
  const y = py < 0.33 ? 0 : py < 0.67 ? 1 : 2;
  return CELLS.find(c => c.x === x && c.y === y);
}

function getCellCenter(x, y) {
  const positions = [0.165, 0.5, 0.835]; // Centers of each third
  return { x: positions[x], y: positions[y] };
}

export default function ToneMatrix({ onPick, disabled, activeId }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 }); // Start at center (neutral-balanced)
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const activeCell = useMemo(() => CELLS.find(c => c.id === activeId) || null, [activeId]);
  const currentCell = snapToCell(pos.x, pos.y);

  useEffect(() => {
    if (activeCell) {
      const center = getCellCenter(activeCell.x, activeCell.y);
      setPos(center);
    }
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

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    
    const cell = snapToCell(pos.x, pos.y);
    let newX = cell.x;
    let newY = cell.y;
    
    switch(e.key) {
      case 'Enter':
      case ' ':
        commit();
        e.preventDefault();
        break;
      case 'ArrowLeft':
        newX = Math.max(0, cell.x - 1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        newX = Math.min(2, cell.x + 1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        newY = Math.max(0, cell.y - 1);
        e.preventDefault();
        break;
      case 'ArrowDown':
        newY = Math.min(2, cell.y + 1);
        e.preventDefault();
        break;
      default:
        return;
    }
    
    if (newX !== cell.x || newY !== cell.y) {
      const center = getCellCenter(newX, newY);
      setPos(center);
    }
  }, [pos, commit, disabled]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-medium text-gray-700">Tone Matrix</div>
      
      <div className="relative">
        {/* Axis labels - Top */}
        <div className="absolute inset-x-0 -top-7 text-xs text-gray-600 font-medium">
          <div className="flex justify-between px-8">
            <span>Concise</span>
            <span>Balanced</span>
            <span>Elaborate</span>
          </div>
        </div>
        
        {/* Axis labels - Left */}
        <div className="absolute -left-12 inset-y-0 text-xs text-gray-600 font-medium">
          <div className="h-full flex flex-col justify-between py-8">
            <span>Formal</span>
            <span>Neutral</span>
            <span>Casual</span>
          </div>
        </div>

        {/* Main Matrix Grid */}
        <div
          ref={ref}
          role="application"
          aria-label="Tone adjustment matrix"
          tabIndex={0}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onPointerDown={(e) => { 
            e.target.setPointerCapture?.(e.pointerId); 
            onPointer(e); 
            setIsDragging(true);
          }}
          onPointerMove={(e) => {
            if (isDragging) onPointer(e);
          }}
          onPointerUp={commit}
          onPointerCancel={() => setIsDragging(false)}
          onKeyDown={handleKeyDown}
          className={[
            'relative w-full h-64 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100',
            'border-2 transition-all duration-200',
            'focus:outline-none focus:ring-4 focus:ring-indigo-100',
            disabled 
              ? 'opacity-60 cursor-not-allowed border-gray-200' 
              : 'border-gray-300 hover:border-indigo-400 cursor-crosshair',
            isDragging ? 'ring-4 ring-indigo-100 border-indigo-500' : ''
          ].join(' ')}
        >
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ borderRadius: 'inherit' }}>
            {/* Vertical lines */}
            <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="#d1d5db" strokeWidth="1" />
            <line x1="66.67%" y1="0" x2="66.67%" y2="100%" stroke="#d1d5db" strokeWidth="1" />
            {/* Horizontal lines */}
            <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="#d1d5db" strokeWidth="1" />
            <line x1="0" y1="66.67%" x2="100%" y2="66.67%" stroke="#d1d5db" strokeWidth="1" />
          </svg>

          {/* Cell backgrounds - highlight on hover */}
          {CELLS.map(cell => {
            const isActive = activeId === cell.id;
            const isCurrent = currentCell?.id === cell.id && (isDragging || isHovering);
            return (
              <div
                key={cell.id}
                className={[
                  'absolute transition-all duration-200 pointer-events-none',
                  isActive ? 'bg-indigo-100/60' : '',
                  isCurrent && !isActive ? 'bg-indigo-50/40' : ''
                ].join(' ')}
                style={{
                  left: `${(cell.x / 3) * 100}%`,
                  top: `${(cell.y / 3) * 100}%`,
                  width: '33.33%',
                  height: '33.33%',
                  borderRadius: '4px'
                }}
              />
            );
          })}

          {/* Gradient overlay following cursor */}
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200"
            style={{ 
              background: `radial-gradient(180px circle at ${pos.x * 100}% ${pos.y * 100}%, rgba(99,102,241,0.12), transparent)`,
              opacity: isDragging ? 1 : isHovering ? 0.7 : 0.3
            }} 
          />

          {/* Thumb/Cursor indicator */}
          <div
            className={[
              'absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none',
              'transition-all duration-150 ease-out'
            ].join(' ')}
            style={{ 
              left: `${pos.x * 100}%`, 
              top: `${pos.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : isHovering ? 1.05 : 1})`
            }}
          >
            {/* Outer ring */}
            <div className={[
              'size-10 rounded-full',
              'bg-white shadow-lg',
              'ring-4 ring-indigo-500/20'
            ].join(' ')}>
              {/* Inner dot */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600">
                <div className="absolute inset-0.5 rounded-full bg-white/30" />
              </div>
            </div>
          </div>

          {/* Cell labels */}
          {CELLS.map(cell => {
            const isActive = activeId === cell.id;
            const isCurrent = currentCell?.id === cell.id;
            return (
              <div
                key={`label-${cell.id}`}
                className={[
                  'absolute text-[10px] px-1.5 py-0.5 rounded pointer-events-none',
                  'transition-all duration-200',
                  isActive 
                    ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                    : isCurrent && (isDragging || isHovering)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500'
                ].join(' ')}
                style={{ 
                  left: `${(cell.x / 3) * 100 + 16.67}%`,
                  top: `${(cell.y / 3) * 100 + 16.67}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {cell.label}
              </div>
            );
          })}
        </div>

        {/* Tooltip for current position */}
        {(isDragging || isHovering) && currentCell && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              {currentCell.label}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Click and drag to adjust tone • Use arrow keys for precise control</p>
        <p className="text-[10px]">Release to apply the selected tone</p>
      </div>
    </div>
  );
}