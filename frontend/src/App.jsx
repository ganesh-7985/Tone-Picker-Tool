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
import { FileText, Sliders } from 'lucide-react';

export default function App() {
  const [saved, setSaved] = useLocalStorage('toneTool:v2', {
    axesActiveId: null,
    lastAxes: null,
    history: createHistory('Paste or type your text here, then use the tone picker on the right to adjust its style.')
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
        const onConfirm = () => setState(s => push({ ...s, current: s.current }, preview));
        previewConfirmRef.current = onConfirm;
        return;
      }

      // Instant apply with optimistic history push
      const prev = state;
      const optimistic = push(state, currentText);
      setState(optimistic);

      const out = await callToneAPI(currentText, { formality: axesObj.formality, verbosity: axesObj.verbosity });
      setState(s => ({ ...s, current: out }));
      if (!isFromShortcut) notify('✨ Tone applied', axesObj.id.replace('-', ' / '));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to change tone');
      notify(' Error', e.message || 'Tone service failed');
      setState(prev => prev); // no-op, optimistic revert handled if used
    } finally {
      setLoading(false);
    }
  }, [currentText, state]);

  const previewConfirmRef = useRef(() => {});

  function onChangeText(t) { setError(null); setState(s => ({ ...s, current: t })); }
  function undo() { setState(s => doUndo(s)); }
  function redo() { setState(s => doRedo(s)); }
  function reset() {
    setAxesActiveId(null);
    setError(null);
    setState(s => resetTo(s, ''));
    notify(' Reset', 'Editor cleared');
  }

  return (
    <Tooltip.Provider delayDuration={200}>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sliders className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tone Picker</h1>
                <p className="text-sm text-gray-600 mt-0.5">Transform your text with AI-powered tone adjustment</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Text Editor</span>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Editor value={currentText} onChange={onChangeText} disabled={loading} />
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tone Controls</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="pb-4 border-b border-gray-100">
                  <Toolbar
                    onUndo={undo}
                    onRedo={redo}
                    onReset={reset}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    disabled={loading}
                    onApplyLast={() => lastAxes && applyTone(lastAxes, true)}
                    hasLastTone={!!lastAxes}
                  />
                  {axesActiveId && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        Active: <span className="font-medium">{axesActiveId.replace('-', ' / ')}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Tone Matrix */}
                <ToneMatrix onPick={applyTone} disabled={loading} activeId={axesActiveId} />

                {/* Status Messages */}
                {loading && (
                  <div className="flex justify-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <Spinner label="Applying tone transformation…" />
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Ctrl+Z</kbd> Undo • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Ctrl+Y</kbd> Redo • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Esc</kbd> Reset • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Ctrl+Enter</kbd> Apply Last</p>
            <p>Your work is automatically saved in your browser's local storage</p>
          </div>
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
    </div>
    </Tooltip.Provider>
  );
}