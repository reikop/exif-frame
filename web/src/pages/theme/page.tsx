import { BlockTitle, List, Navbar, Page, Tabbar, TabbarLink } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import SettingsIcon from '../../icons/settings.icon';
import ImageIcon from '../../icons/image.icon';
import GenerateIcon from '../../icons/generate.icon';
import themes from '../../themes';
import ThemeListItem from './components/theme.list-item';
import ThemeOptionListInput from './components/theme-option.list-input';
import Loading from '../convert/components/loading';
import ThemeOptionResetButton from './components/theme-option-reset.button';
import Preview from './components/preview';
import RerenderButton from './components/rerender.button';
import Customize from './database/customize';
import PreviewFullscreen from './components/preview-fullscreen';

const ThemeSettingsPage = () => {
  const { t } = useTranslation();
  const { selectedThemeName, setTabIndex, setRerenderOptions, darkMode, setPreviewFullscreen } = useStore();
  const theme = themes.find((theme) => theme.name === selectedThemeName);
  const presets = (theme as { presets?: { name: string; values: Record<string, string | number | boolean> }[] } | undefined)?.presets;
  const presetIdle = darkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200';

  const applyPreset = (values: Record<string, string | number | boolean>) => {
    if (!theme) return;
    theme.options.forEach((opt) => Customize.delete(theme.name, opt.id));
    Object.entries(values).forEach(([k, v]) => Customize.set(theme.name, k, v));
    setRerenderOptions();
  };

  return (
    <Page style={{ paddingBottom: '10rem' }}>
      <Navbar large transparent title={t('root.themes')} />

      <div onClick={() => setPreviewFullscreen(true)} className="cursor-zoom-in">
        <Preview />
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <RerenderButton />
        <button
          type="button"
          onClick={() => setPreviewFullscreen(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-neutral-800 text-neutral-200' : 'bg-gray-100 text-gray-800'}`}
        >
          사진 전체보기
        </button>
      </div>

      <BlockTitle>{t('root.themes.list')}</BlockTitle>
      <List strongIos inset>
        {themes.map((theme, index) => (
          <ThemeListItem key={index} name={theme.name} />
        ))}
      </List>

      {presets && presets.length > 0 && (
        <>
          <BlockTitle>Presets</BlockTitle>
          <div className="flex flex-wrap gap-2 px-4">
            {presets.map((preset) => (
              <button key={preset.name} onClick={() => applyPreset(preset.values)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${presetIdle}`}>
                {preset.name}
              </button>
            ))}
          </div>
        </>
      )}

      {theme?.options.length !== 0 && (
        <BlockTitle>
          {t('root.themes.customize')}
          <ThemeOptionResetButton />
        </BlockTitle>
      )}
      <List strongIos inset>
        {theme?.options.map((option, index) => {
          return <ThemeOptionListInput {...option} key={index} />;
        })}
      </List>

      <Tabbar labels={true} icons={true} className="left-0 bottom-0 fixed">
        <TabbarLink key={1} active={false} label={t('root.tab.convert')} icon={<GenerateIcon size={24} />} onClick={() => setTabIndex(0)} />
        <TabbarLink key={2} active={true} label={t('root.tab.theme-settings')} icon={<ImageIcon size={24} />} onClick={() => setTabIndex(1)} />
        <TabbarLink key={3} active={false} label={t('root.tab.export-settings')} icon={<SettingsIcon size={24} />} onClick={() => setTabIndex(2)} />
      </Tabbar>

      <Loading />
      <PreviewFullscreen />
    </Page>
  );
};

export default ThemeSettingsPage;
