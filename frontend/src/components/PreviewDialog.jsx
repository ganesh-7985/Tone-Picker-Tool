import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, X, FileText, Sparkles } from 'lucide-react';

export default function PreviewDialog({ open, setOpen, original, preview, onConfirm }) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 
                                   rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Tone Preview
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-0.5">Review the changes before applying</p>
              </div>
            </div>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Original Text</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {original.length} chars
                  </span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {original}
                  </div>
                </div>
              </div>

              {/* Arrow indicator for desktop */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="p-2 bg-white rounded-full shadow-lg border border-gray-200">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">Transformed Text</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
                    {preview.length} chars
                  </span>
                </div>
                <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/30 p-4">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {preview}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              The transformed text will replace your current text
            </p>
            <div className="flex gap-3">
              <Dialog.Close className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </Dialog.Close>
              <button 
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm"
                onClick={() => { 
                  onConfirm(); 
                  setOpen(false); 
                }}
              >
                Apply Transformation
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}