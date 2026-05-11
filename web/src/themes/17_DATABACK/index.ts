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
  { id: 'FONT_SIZE', type: 'number', default: 100, description: 'px' },
  { id: 'LETTER_SPACING', type: 'number', default: 0, description: 'px (can be negative)' },
  { id: 'OFFSET', type: 'number', default: 120, description: 'distance from edge (px)' },
  { id: 'GLOW', type: 'boolean', default: true, description: 'soft glow like LED stamp' },
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
  const LETTER_SPACING = input.get('LETTER_SPACING') as number;
  const OFFSET = input.get('OFFSET') as number;
  const GLOW = input.get('GLOW') as boolean;

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
  context.globalAlpha = TEXT_ALPHA;
  context.fillStyle = TEXT_COLOR;
  context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  context.letterSpacing = `${LETTER_SPACING}px`;

  if (GLOW) {
    context.shadowColor = TEXT_COLOR;
    context.shadowBlur = FONT_SIZE * 0.18;
  }

  switch (POSITION) {
    case 'bottom-left':
      context.textAlign = 'left';
      context.textBaseline = 'bottom';
      context.fillText(text, OFFSET, canvas.height - OFFSET);
      break;
    case 'top-right':
      context.textAlign = 'right';
      context.textBaseline = 'top';
      context.fillText(text, canvas.width - OFFSET, OFFSET);
      break;
    case 'top-left':
      context.textAlign = 'left';
      context.textBaseline = 'top';
      context.fillText(text, OFFSET, OFFSET);
      break;
    case 'bottom-right':
    default:
      context.textAlign = 'right';
      context.textBaseline = 'bottom';
      context.fillText(text, canvas.width - OFFSET, canvas.height - OFFSET);
      break;
  }

  context.restore();
  return canvas;
};

export { DATABACK_FUNC, DATABACK_OPTIONS };
