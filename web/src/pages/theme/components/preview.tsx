import render from '../../../core/drawing/render';
import { useEffect } from 'react';
import { useStore } from '../../../store';
import themes from '../../../themes';
import { ThemeOptionInput, getConverter } from '../types/theme-option';
import Customize from '../database/customize';
import free from '../../../core/drawing/free';

type Props = { className?: string };

const Preview = ({ className = 'mt-4' }: Props) => {
  const store = useStore();
  const { selectedThemeName, rerenderOptions, tabIndex, darkMode } = useStore();

  useEffect(() => {
    const preview = document.getElementById('preview') as HTMLCanvasElement;
    preview.width = 0;
    preview.height = 0;

    if (store.photos.length === 0) return;
    if (tabIndex !== 1) return;

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
        preview.width = 1000;
        preview.height = 1000 / ratio;
      } else {
        preview.height = 1000;
        preview.width = 1000 * ratio;
      }
      const parentWidth = preview.parentElement?.clientWidth ?? 800;
      const maxDisplayWidth = Math.min(parentWidth, 800);
      const maxDisplayHeight = window.innerHeight * 0.7;
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
  }, [selectedThemeName, rerenderOptions, tabIndex]);

  return (
    <canvas
      id="preview"
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
