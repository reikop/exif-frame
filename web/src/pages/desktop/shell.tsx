import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import GenerateIcon from '../../icons/generate.icon';
import ImageIcon from '../../icons/image.icon';
import SettingsIcon from '../../icons/settings.icon';
import ConvertCenter from './convert-center';
import ThemeCenter from './theme-center';
import SettingsCenter from './settings-center';
import ThemeOptionsPanel from './theme-options-panel';
import OverrideMetadataPopup from '../convert/components/override-metadata.popup';
import AddPhotoErrorDialog from '../convert/components/add-photo-error.dialog';
import PreviewFullscreen from '../theme/components/preview-fullscreen';
import LanguagePopover from '../setting/components/language.popover';
import RatioPopover from '../setting/components/ratio.popover';
import DateNotationPopover from '../setting/components/date-notation.popover';
import OverrideMetadataPopover from '../setting/components/override-metadata.popover';
import Loading from '../convert/components/loading';

type NavItem = { index: number; label: string; icon: JSX.Element };

const DesktopShell = () => {
  const { t } = useTranslation();
  const { tabIndex, setTabIndex, darkMode } = useStore();

  const navItems: NavItem[] = [
    { index: 0, label: t('root.tab.convert'), icon: <GenerateIcon size={20} /> },
    { index: 1, label: t('root.tab.theme-settings'), icon: <ImageIcon size={20} /> },
    { index: 2, label: t('root.tab.export-settings'), icon: <SettingsIcon size={20} /> },
  ];

  const rootBg = darkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900';
  const sidebarBg = darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200';
  const activeItem = darkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-900';
  const idleItem = darkMode ? 'hover:bg-neutral-800/60 text-neutral-400' : 'hover:bg-gray-100 text-gray-600';
  const panelBg = darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200';

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${rootBg}`}>
      <aside className={`w-56 shrink-0 flex flex-col border-r ${sidebarBg}`}>
        <div className="px-5 py-5">
          <h1 className="text-lg font-bold tracking-tight">EXIF Frame</h1>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.index}
              onClick={() => setTabIndex(item.index)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tabIndex === item.index ? activeItem : idleItem}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto px-10 py-8">
        {tabIndex === 0 && <ConvertCenter />}
        {tabIndex === 1 && <ThemeCenter />}
        {tabIndex === 2 && <SettingsCenter />}
      </main>

      {tabIndex === 1 && (
        <aside className={`w-96 shrink-0 overflow-y-auto border-l ${panelBg}`}>
          <ThemeOptionsPanel />
        </aside>
      )}

      <OverrideMetadataPopup />
      <AddPhotoErrorDialog />
      <LanguagePopover />
      <RatioPopover />
      <DateNotationPopover />
      <OverrideMetadataPopover />
      <Loading />
      <PreviewFullscreen />
    </div>
  );
};

export default DesktopShell;
