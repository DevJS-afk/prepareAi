import { useEffect } from 'react';

export const useGlobalShortcuts = (handlers: { [key: string]: (e: KeyboardEvent) => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }
      
      const handler = handlers[e.key] || handlers[e.code];
      if (handler) {
        // We do not prevent default here unconditionally, let the handler do it if needed
        handler(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
