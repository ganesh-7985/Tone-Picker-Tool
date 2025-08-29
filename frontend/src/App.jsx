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
import { FileText, Sliders, Wand2 } from 'lucide-react';


export default function App() {
  const [saved, setSaved] = useLocalStorage('toneTool:v3', {
    axesActiveId: null,
    lastAxes: null,
    history: createHistory('Welcome! Type or paste your text here, then use the tone matrix to transform it into different styles. Try the presets for quick adjustments or fine-tune with the grid.')
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
  const [activePreset, setActivePreset] = useState(null);
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
      if (!isFromShortcut) notify('✨ Tone Applied', `Changed to ${axesObj.label || axesObj.id.replace('-', ' ')}`);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to change tone');
      notify('Error', e.message || 'Tone service failed');
      setState(prev => prev);
    } finally {
      setLoading(false);
    }
  }, [currentText, state]);

  const applyPreset = useCallback((preset) => {
    setActivePreset(preset.id);
    const toneConfig = {
      id: `${preset.formality}-${preset.verbosity}`,
      formality: preset.formality,
      verbosity: preset.verbosity,
      label: preset.name
    };
    applyTone(toneConfig);
  }, [applyTone]);

  const previewConfirmRef = useRef(() => {});

  function onChangeText(t) { setError(null); setState(s => ({ ...s, current: t })); }
  function undo() { setState(s => doUndo(s)); notify('↩️ Undo', 'Previous version restored'); }
  function redo() { setState(s => doRedo(s)); notify('↪️ Redo', 'Next version restored'); }
  function reset() {
    setAxesActiveId(null);
    setActivePreset(null);
    setError(null);
    setState(s => resetTo(s, ''));
    notify('🔄 Reset', 'Editor cleared');
  }

  return (
    <Tooltip.Provider delayDuration={200}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Wand2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tone Transformer
                </h1>
                <p className="text-sm text-gray-600 mt-1">AI-powered text tone adjustment with Mistral</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Editor (3 columns) */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Text Editor</span>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Editor value={currentText} onChange={onChangeText} disabled={loading} />
            </div>
          </div>

          {/* Right: Controls (2 columns) */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tone Controls</span>
            </div>
            
            <div className="space-y-4">
              {/* Presets */}

              {/* Main Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="space-y-5">
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
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                          Last: <span className="font-medium">{axesActiveId.replace(/-/g, ' ')}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tone Matrix */}
                  <ToneMatrix 
                    onPick={applyTone} 
                    disabled={loading} 
                    activeId={axesActiveId} 
                  />

                  {/* Status Messages */}
                  {loading && (
                    <div className="flex justify-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                      <Spinner label="Transforming your text..." />
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
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              💡 Shortcuts: 
              <kbd className="mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Ctrl+Z</kbd>Undo 
              <kbd className="mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Ctrl+Y</kbd>Redo 
              <kbd className="mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Esc</kbd>Reset 
              <kbd className="mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Ctrl+Enter</kbd>Apply Last
            </p>
            <p>Your work is automatically saved locally • Drag the matrix or use presets for quick adjustments</p>
          </div>
        </footer>

        <AppToast open={toastOpen} setOpen={setToastOpen} title={toastMsg.title} description={toastMsg.desc} />

        {/* Preview Dialog */}
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