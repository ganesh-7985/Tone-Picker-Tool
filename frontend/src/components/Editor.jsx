import { useEffect, useRef, useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

export default function Editor({ value, onChange, disabled }) {
  const [copied, setCopied] = useState(false);
  const taRef = useRef(null);
  const count = value?.length ?? 0;
  const words = value?.trim() ? value.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // Auto-resize textarea
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = `${Math.max(400, taRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>{words} {words === 1 ? 'word' : 'words'}</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div>
            <span>{count.toLocaleString()} {count === 1 ? 'character' : 'characters'}</span>
          </div>
        </div>
        <button
          className={[
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-all",
            copied 
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          ].join(' ')}
          onClick={async () => { 
            await navigator.clipboard.writeText(value || ''); 
            setCopied(true); 
          }}
          disabled={disabled || !value}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 p-4">
        <textarea
          ref={taRef}
          className={[
            "w-full min-h-[400px] resize-none",
            "text-gray-900 leading-relaxed",
            "outline-none focus:outline-none",
            "placeholder:text-gray-400",
            disabled ? "opacity-60 cursor-not-allowed" : ""
          ].join(' ')}
          placeholder="Start typing or paste your text here. Then use the tone picker on the right to transform it into different styles - from formal business communication to casual conversation."
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          style={{ 
            fontSize: '15px',
            lineHeight: '1.6'
          }}
        />
      </div>

      {/* Bottom gradient fade */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}