import { useState, useEffect } from 'react';

export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Use visualViewport API for accurate keyboard detection
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleResize = () => {
        const viewportHeight = window.visualViewport!.height;
        const windowHeight = window.innerHeight;
        const keyboardH = windowHeight - viewportHeight;
        setKeyboardHeight(keyboardH > 0 ? keyboardH : 0);
      };

      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  return keyboardHeight;
}

export function useIsKeyboardOpen(): boolean {
  const keyboardHeight = useKeyboardHeight();
  return keyboardHeight > 0;
}
