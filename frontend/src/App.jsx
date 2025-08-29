import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor from './components/Editor.jsx';
import ToneMatrix from './components/ToneMatrix.jsx';
import Toolbar from './components/Toolbar.jsx';
import Spinner from './components/Spinner.jsx';
import AppToast from './components/Toast.jsx';
import PreviewDialog from './components/PreviewDialog.jsx';
import useLocalStorage from './lib/useLocalStorage.js';
import { createHistory, push, undo as doUndo, redo as doRedo, resetTo } from './lib/history.js';
import { ENABLE_PREVIEW } from './config.ts';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function App() {
  const [saved, setSaved] = useLocalStorage('toneTool:v2', {
    axesActiveId: null,
    lastAxes: null,
    history: createHistory('Paste or type your text, then drag the picker →')
  });

  const [state, setState] = useState(saved.history);
  const [axesActiveId, setAxesActiveId] = useState(saved.axesActiveId);
  const [lastAxes, setLastAxes] = useState(saved.lastAxes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: '', desc: '' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const controllerRef = useRef(null);

  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;
  const currentText = state.current;

  useEffect(() => { setSaved({ axesActiveId, lastAxes, history: state }); }, [axesActiveId, lastAxes, state]);
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if (mod && (e.key === 'Enter')) { e.preventDefault(); if (lastAxes) applyTone(lastAxes, true); }
      if (e.key === 'Escape') { e.preventDefault(); reset(); }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lastAxes, state]);

  const notify = (title, desc) => { setToastMsg({ title, desc }); setToastOpen(true); };

  async function callToneAPI(text, axes) {
    controllerRef.current?.abort?.();
    controllerRef.current = new AbortController();
    const res = await fetch('/api/tone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controllerRef.current.signal,
      body: JSON.stringify({ text, axes })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Tone service error');
    return data.text;
  }

  const applyTone = useCallback(async (axesObj, isFromShortcut = false) => {
    if (!currentText.trim()) {
      setError('Please enter some text first.');
      return;
    }
    setAxesActiveId(axesObj.id);
    setLastAxes({ id: axesObj.id, formality: axesObj.formality, verbosity: axesObj.verbosity });
    setError(null);

    try {
      setLoading(true);
      if (ENABLE_PREVIEW) {
        const preview = await callToneAPI(currentText, { formality: axesObj.formality, verbosity: axesObj.verbosity });
        setPreviewText(preview);
        setPreviewOpen(true);
        setLoading(false);
        // Commit when user confirms in PreviewDialog
        const onConfirm = () => setState(s => push({ ...s, current: s.current }, preview));
        // we pass via closure into dialog component
        // (handled below)
        previewConfirmRef.current = onConfirm;
        return;
      }

      // Instant apply with optimistic history push
      const prev = state;
      const optimistic = push(state, currentText);
      setState(optimistic);

      const out = await callToneAPI(currentText, { formality: axesObj.formality, verbosity: axesObj.verbosity });
      setState(s => ({ ...s, current: out }));
      if (!isFromShortcut) notify('Tone applied', axesObj.id.replace('-', ' / '));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to change tone');
      notify('Error', e.message || 'Tone service failed');
      setState(prev => prev); // no-op, optimistic revert handled if used
    } finally {
      setLoading(false);
    }
  }, [currentText, state]);

  const previewConfirmRef = useRef(() => {});
  const rightPanel = useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toolbar
          onUndo={() => setState(s => doUndo(s))}
          onRedo={() => setState(s => doRedo(s))}
          onReset={reset}
          canUndo={canUndo}
          canRedo={canRedo}
          disabled={loading}
          onApplyLast={() => lastAxes && applyTone(lastAxes, true)}
          hasLastTone={!!lastAxes}
        />
        {axesActiveId && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Last tone: {axesActiveId.replace('-', ' / ')}
          </span>
        )}
      </div>
      <ToneMatrix onPick={applyTone} disabled={loading} activeId={axesActiveId} />
      {loading && <Spinner label="Rewriting tone…" />}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  ), [axesActiveId, canRedo, canUndo, error, loading, lastAxes]);

  function onChangeText(t) { setError(null); setState(s => ({ ...s, current: t })); }
  function undo() { setState(s => doUndo(s)); }
  function redo() { setState(s => doRedo(s)); }
  function reset() {
    setAxesActiveId(null);
    setError(null);
    setState(s => resetTo(s, ''));
    notify('Reset', 'Editor cleared');
  }

  return (
    <Tooltip.Provider delayDuration={200}>
    <div className="mx-auto max-w-6xl p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Tone Picker Text Tool</h1>
        <a className="text-sm text-indigo-600 hover:underline" href="https://docs.mistral.ai" target="_blank" rel="noreferrer">Mistral Docs</a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Editor value={currentText} onChange={onChangeText} disabled={loading} />
        </div>
        <div className="col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {rightPanel}
          </div>
        </div>
      </div>

      <footer className="mt-6 text-xs text-gray-500">
        Undo/Redo persists in localStorage. Reset clears the editor. Drag the thumb and release to apply a tone.
      </footer>

      <AppToast open={toastOpen} setOpen={setToastOpen} title={toastMsg.title} description={toastMsg.desc} />

      {/* Conditional preview workflow */}
      {ENABLE_PREVIEW && (
        <PreviewDialog
          open={previewOpen}
          setOpen={setPreviewOpen}
          original={currentText}
          preview={previewText}
          onConfirm={() => previewConfirmRef.current?.()}
        />
      )}
    </div>
    </Tooltip.Provider>
  );
}
