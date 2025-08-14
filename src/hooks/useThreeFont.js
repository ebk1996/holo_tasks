import { useEffect, useRef, useState } from 'react';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

export function useThreeFont(url) {
  const fontRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loader = new FontLoader();
    loader.load(
      url,
      (font) => {
        if (!mounted) return;
        fontRef.current = font;
        setReady(true);
      },
      undefined,
      () => setReady(false)
    );
    return () => {
      mounted = false;
    };
  }, [url]);

  return { font: fontRef.current, ready };
}
