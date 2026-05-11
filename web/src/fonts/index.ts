enum Font {
  Digital7 = 'digital-7',
  Digital7Italic = 'digital-7-italic',
  Poxel = 'poxel',
  DINAlternateBold = 'din-alternate-bold',
  Pretendard = 'pretendard',
  DSEG7ClassicItalic = 'DSEG7Classic-Italic',
  DSEG7ClassicLightItalic = 'DSEG7Classic-LightItalic',
  DSEG7ClassicBoldItalic = 'DSEG7Classic-BoldItalic',
  DSEG7ClassicRegular = 'DSEG7Classic-Regular',
  DSEG7ClassicLight = 'DSEG7Classic-Light',
  DSEG7ClassicBold = 'DSEG7Classic-Bold',
  DSEG7ModernItalic = 'DSEG7Modern-Italic',
  DSEG7ModernRegular = 'DSEG7Modern-Regular',
  DSEG7ModernLight = 'DSEG7Modern-Light',
  DSEG7ModernBold = 'DSEG7Modern-Bold',
  DSEG14ClassicItalic = 'DSEG14Classic-Italic',
  DSEG14ClassicRegular = 'DSEG14Classic-Regular',
  DSEG14ClassicLight = 'DSEG14Classic-Light',
  DSEG14ClassicBold = 'DSEG14Classic-Bold',
  NewXDigitalCursive = 'new-x-digital-cursive',
  NewXDigital = 'new-x-digital',
  NewXDigitalHollow = 'new-x-digital-hollow',
  NewXDigitalLight = 'new-x-digital-light',
  LcdDot = 'LCDDot',
}

// Load all fonts from the fonts public/fonts folder
Object.values(Font).forEach((font) =>
  new FontFace(font, `url(/fonts/${font}.ttf)`)
    .load()
    .then((loadedFont) => document.fonts.add(loadedFont))
    .catch((err) => console.error(`Failed to load font "${font}":`, err))
);

export default Font;
