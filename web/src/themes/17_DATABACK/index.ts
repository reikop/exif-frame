import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import Font from '../../fonts';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';

const DATABACK_OPTIONS: ThemeOption[] = [
  {
    id: 'DATE_FORMAT',
    type: 'select',
    options: [
      "'YY M DD",
      "'YY MM DD",
      'YY MM DD',
      'DD MM YY',
      'MM DD YY',
      'YYYY MM DD',
      'YYYY/MM/DD',
      'YYYY-MM-DD',
      'YY MM DD HH:MM',
      'DD MM YY HH:MM',
    ],
    default: "'YY M DD",
    description: 'date stamp format',
  },
  {
    id: 'POSITION',
    type: 'select',
    options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    default: 'bottom-right',
    description: 'date stamp position',
  },
  {
    id: 'TEXT_COLOR',
    type: 'color',
    default: '#FF5722',
    description: 'classic databack red-orange',
  },
  { id: 'TEXT_ALPHA', type: 'range-slider', default: 0.85, min: 0, max: 1, step: 0.01, description: '0 - 1' },
  {
    id: 'FONT_FAMILY',
    type: 'select',
    options: ['Barlow', ...Object.values(Font)],
    default: 'DSEG7Classic-Italic',
    description: 'italic segment fonts only',
  },
  { id: 'FONT_SIZE', type: 'range-slider', default: 75, min: 20, max: 400, step: 1, description: 'px' },
  { id: 'SPACE_GAP', type: 'range-slider', default: 70, min: -50, max: 200, step: 1, description: 'extra px added on spaces only' },
  { id: 'OFFSET_X', type: 'range-slider', default: 450, min: 0, max: 1000, step: 5, description: 'horizontal distance from edge (px)' },
  { id: 'OFFSET_Y', type: 'range-slider', default: 330, min: 0, max: 1000, step: 5, description: 'vertical distance from edge (px)' },
  { id: 'GLOW', type: 'boolean', default: true, description: 'soft glow like LED stamp' },
  { id: 'GLOW_COLOR', type: 'color', default: '#FF5722', description: 'glow color (independent from text color)' },
  { id: 'GLOW_RADIUS', type: 'range-slider', default: 70, min: 0, max: 100, step: 0.5, description: 'glow blur radius (px)' },
  { id: 'BLUR', type: 'range-slider', default: 5, min: 0, max: 10, step: 0.1, description: 'text blur (px, decimal)' },
];

const pad2 = (n: number): string => n.toString().padStart(2, '0');

const formatDate = (date: Date, format: string): string => {
  const YYYY = date.getFullYear().toString();
  const YY = YYYY.slice(-2);
  const M = (date.getMonth() + 1).toString();
  const MM = pad2(date.getMonth() + 1);
  const DD = pad2(date.getDate());
  const HH = pad2(date.getHours());
  const mm = pad2(date.getMinutes());

  switch (format) {
    case "'YY M DD":
      return `'${YY} ${M} ${DD}`;
    case "'YY MM DD":
      return `'${YY} ${MM} ${DD}`;
    case 'YY MM DD':
      return `${YY} ${MM} ${DD}`;
    case 'DD MM YY':
      return `${DD} ${MM} ${YY}`;
    case 'MM DD YY':
      return `${MM} ${DD} ${YY}`;
    case 'YYYY MM DD':
      return `${YYYY} ${MM} ${DD}`;
    case 'YYYY/MM/DD':
      return `${YYYY}/${MM}/${DD}`;
    case 'YYYY-MM-DD':
      return `${YYYY}-${MM}-${DD}`;
    case 'YY MM DD HH:MM':
      return `${YY} ${MM} ${DD} ${HH}:${mm}`;
    case 'DD MM YY HH:MM':
      return `${DD} ${MM} ${YY} ${HH}:${mm}`;
    default:
      return `'${YY} ${M} ${DD}`;
  }
};

const DATABACK_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const DATE_FORMAT = (input.get('DATE_FORMAT') as string).trim();
  const POSITION = (input.get('POSITION') as string).trim();
  const TEXT_COLOR = (input.get('TEXT_COLOR') as string).trim();
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const FONT_FAMILY = (input.get('FONT_FAMILY') as string).trim();
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const SPACE_GAP = input.get('SPACE_GAP') as number;
  const OFFSET_X = input.get('OFFSET_X') as number;
  const OFFSET_Y = input.get('OFFSET_Y') as number;
  const GLOW = input.get('GLOW') as boolean;
  const GLOW_COLOR = (input.get('GLOW_COLOR') as string).trim();
  const GLOW_RADIUS = input.get('GLOW_RADIUS') as number;
  const BLUR = input.get('BLUR') as number;

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: '#000000',
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  const rawDate = overrideExifMetadata()?.takenAt || photo.metadata.takenAt;
  if (!rawDate) return canvas;

  const date = new Date(rawDate);
  if (isNaN(date.getTime())) return canvas;

  const text = formatDate(date, DATE_FORMAT);

  const context = canvas.getContext('2d')!;
  context.save();
  context.fillStyle = TEXT_COLOR;
  context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  context.textAlign = 'left';

  if (BLUR > 0) context.filter = `blur(${BLUR}px)`;

  const tokens = text.split(' ');
  const tokenWidths = tokens.map((tok) => context.measureText(tok).width);
  const naturalSpace = context.measureText(' ').width;
  const gap = naturalSpace + SPACE_GAP;
  const totalWidth = tokenWidths.reduce((a, b) => a + b, 0) + gap * Math.max(0, tokens.length - 1);

  const isPortrait = canvas.height > canvas.width;

  if (isPortrait) {
    context.translate(canvas.width - OFFSET_Y, OFFSET_X + totalWidth);
    context.rotate(-Math.PI / 2);
    context.textBaseline = 'bottom';
  } else {
    let startX: number;
    let y: number;
    switch (POSITION) {
      case 'bottom-left':
        startX = OFFSET_X;
        y = canvas.height - OFFSET_Y;
        context.textBaseline = 'bottom';
        break;
      case 'top-right':
        startX = canvas.width - OFFSET_X - totalWidth;
        y = OFFSET_Y;
        context.textBaseline = 'top';
        break;
      case 'top-left':
        startX = OFFSET_X;
        y = OFFSET_Y;
        context.textBaseline = 'top';
        break;
      case 'bottom-right':
      default:
        startX = canvas.width - OFFSET_X - totalWidth;
        y = canvas.height - OFFSET_Y;
        context.textBaseline = 'bottom';
        break;
    }
    context.translate(startX, y);
  }

  const drawTokens = () => {
    let cursor = 0;
    for (let i = 0; i < tokens.length; i++) {
      context.fillText(tokens[i], cursor, 0);
      cursor += tokenWidths[i] + gap;
    }
  };

  if (GLOW) {
    context.shadowColor = GLOW_COLOR;
    context.globalCompositeOperation = 'lighter';
    const passes = [
      { blurMul: 4, alphaMul: 0.35 },
      { blurMul: 2, alphaMul: 0.55 },
      { blurMul: 1, alphaMul: 1.0 },
    ];
    for (const p of passes) {
      context.globalAlpha = TEXT_ALPHA * p.alphaMul;
      context.shadowBlur = GLOW_RADIUS * p.blurMul;
      drawTokens();
    }
    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 0;
  }

  context.globalAlpha = TEXT_ALPHA;
  drawTokens();

  context.restore();
  return canvas;
};

export { DATABACK_FUNC, DATABACK_OPTIONS };
