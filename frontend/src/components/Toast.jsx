import * as Toast from '@radix-ui/react-toast';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AppToast({ open, setOpen, title, description }) {
  const [viewportReady, setViewportReady] = useState(false);
  
  useEffect(() => setViewportReady(true), []);

  return (
    <Toast.Provider swipeDirection="right" duration={4000}>
      <Toast.Root 
        open={open} 
        onOpenChange={setOpen}
        className="group relative bg-white border border-gray-200 rounded-xl shadow-lg p-4 
                   data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-5 
                   data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full
                   data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
                   data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]
                   transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {title && (
              <Toast.Title className="text-sm font-semibold text-gray-900 mb-1">
                {title}
              </Toast.Title>
            )}
            {description && (
              <Toast.Description className="text-xs text-gray-600">
                {description}
              </Toast.Description>
            )}
          </div>
          <Toast.Action asChild altText="Close">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </Toast.Action>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-xl overflow-hidden">
          <div className="h-full bg-indigo-500 animate-[shrink_4000ms_linear]" 
               style={{ 
                 '@keyframes shrink': {
                   from: { width: '100%' },
                   to: { width: '0%' }
                 }
               }} />
        </div>
      </Toast.Root>
      
      {viewportReady && (
        <Toast.Viewport className="fixed bottom-6 right-6 flex flex-col gap-3 w-96 max-w-[calc(100vw-3rem)] outline-none z-50" />
      )}
    </Toast.Provider>
  );
}