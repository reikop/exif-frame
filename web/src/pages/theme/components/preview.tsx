import render from '../../../core/drawing/render';
import { useEffect } from 'react';
import { useStore } from '../../../store';
import themes from '../../../themes';
import { ThemeOptionInput, getConverter } from '../types/theme-option';
import Customize from '../database/customize';
import free from '../../../core/drawing/free';

type Props = { className?: string; id?: string; fullscreen?: boolean };

const Preview = ({ className = 'mt-4', id = 'preview', fullscreen = false }: Props) => {
  const store = useStore();
  const { selectedThemeName, rerenderOptions, tabIndex, darkMode, previewFullscreen } = useStore();

  useEffect(() => {
    const preview = document.getElementById(id) as HTMLCanvasElement | null;
    if (!preview) return;
    preview.width = 0;
    preview.height = 0;

    if (store.photos.length === 0) return;
    if (tabIndex !== 1 && !fullscreen) return;

    const input: ThemeOptionInput = new Map<string, string | number | boolean>();
    const theme = themes.find((theme) => theme.name === selectedThemeName);
    theme?.options.forEach((option) => {
      const value = Customize.get(selectedThemeName, option.id, getConverter(option.type));
      if (value !== null) {
        input.set(option.id, value);
      } else {
        input.set(option.id, option.default);
      }
    });

    const func = theme?.func;

    render(func!, store.photos[0], input, store).then((canvas) => {
      const ctx = preview.getContext('2d')!;
      const ratio = canvas.width / canvas.height;
      if (canvas.width > canvas.height) {
        preview.width = fullscreen ? 2000 : 1000;
        preview.height = preview.width / ratio;
      } else {
        preview.height = fullscreen ? 2000 : 1000;
        preview.width = preview.height * ratio;
      }
      const parentWidth = preview.parentElement?.clientWidth ?? 800;
      const maxDisplayWidth = fullscreen ? window.innerWidth * 0.95 : Math.min(parentWidth, 800);
      const maxDisplayHeight = fullscreen ? window.innerHeight * 0.92 : window.innerHeight * 0.7;
      let displayWidth: number;
      let displayHeight: number;
      if (preview.width / maxDisplayWidth > preview.height / maxDisplayHeight) {
        displayWidth = maxDisplayWidth;
        displayHeight = displayWidth / ratio;
      } else {
        displayHeight = maxDisplayHeight;
        displayWidth = displayHeight * ratio;
      }
      preview.style.width = `${displayWidth}px`;
      preview.style.height = `${displayHeight}px`;
      ctx.clearRect(0, 0, preview.width, preview.height);
      ctx.fillStyle = darkMode ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, preview.width, preview.height);
      ctx.fillStyle = '#ffffff';
      ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
      free(canvas);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThemeName, rerenderOptions, tabIndex, previewFullscreen]);

  return (
    <canvas
      id={id}
      className={className}
      style={{
        display: 'block',
        margin: '0 auto',
        backgroundColor: darkMode ? '#000000' : '#ffffff',
      }}
    />
  );
};

export default Preview;
