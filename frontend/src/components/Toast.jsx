import * as Toast from '@radix-ui/react-toast';
import { useState, useEffect } from 'react';

export default function AppToast({open,setOpen,title,description}){
    const [viewportReady,setViewportReady] = useState(false);
    useEffect(()=>setViewportReady(true),[]);
    return(
    <>
        <Toast.Provider swipeDirection="right" duration={3000}>
          <Toast.Root open={open} onOpenChange={setOpen}
            className="bg-white border border-gray-200 rounded-xl shadow p-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-2">
            {title && <Toast.Title className="text-sm font-medium">{title}</Toast.Title>}
            {description && <Toast.Description className="text-xs text-gray-600 mt-1">{description}</Toast.Description>}
          </Toast.Root>
          {viewportReady && (
            <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-80 max-w-[100vw] outline-none" />
          )}
        </Toast.Provider>
    </>
    );
}