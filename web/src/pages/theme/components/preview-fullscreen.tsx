import { useEffect } from 'react';
import { useStore } from '../../../store';
import Preview from './preview';

const PreviewFullscreen = () => {
  const { previewFullscreen, setPreviewFullscreen } = useStore();

  useEffect(() => {
    if (!previewFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewFullscreen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [previewFullscreen, setPreviewFullscreen]);

  if (!previewFullscreen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-zoom-out"
      onClick={() => setPreviewFullscreen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPreviewFullscreen(false);
        }}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
        aria-label="Close"
      >
        ×
      </button>
      <div className="cursor-default" onClick={(e) => e.stopPropagation()}>
        <Preview id="preview-full" fullscreen className="" />
      </div>
    </div>
  );
};

export default PreviewFullscreen;
