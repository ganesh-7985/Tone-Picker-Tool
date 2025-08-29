import { useEffect, useRef, useState } from 'react';
import { Copy } from 'lucide-react';

export default function Editor({ value, onChange, disabled }) {
  const [copied, setCopied] = useState(false);
  const taRef = useRef(null);
  const count = value?.length ?? 0;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="h-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">Characters: <span className="font-medium">{count}</span></div>
        <button
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm hover:shadow disabled:opacity-60"
          onClick={async () => { await navigator.clipboard.writeText(value || ''); setCopied(true); }}
          disabled={disabled}
        >
          <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <textarea
        ref={taRef}
        className="w-full h-full min-h-[60vh] resize-none rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm outline-none focus:ring-4 ring-indigo-100"
        placeholder="Type or paste your text here…"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
