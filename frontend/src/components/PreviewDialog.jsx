import * as Dialog from '@radix-ui/react-dialog';

export default function PreviewDialog({ open, setOpen, original, preview, onConfirm }) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <Dialog.Title className="text-sm font-medium">Tone Preview</Dialog.Title>
            <Dialog.Close className="text-sm text-gray-500 hover:text-gray-700">✕</Dialog.Close>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Original</div>
              <div className="text-sm whitespace-pre-wrap">{original}</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Rewritten</div>
              <div className="text-sm whitespace-pre-wrap">{preview}</div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close className="rounded-lg border border-gray-200 px-3 py-2 text-sm">Cancel</Dialog.Close>
            <button className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm"
              onClick={() => { onConfirm(); setOpen(false); }}>
              Apply
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
