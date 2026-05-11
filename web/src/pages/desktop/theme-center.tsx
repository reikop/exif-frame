import { useTranslation } from 'react-i18next';
import themes from '../../themes';
import Preview from '../theme/components/preview';
import RerenderButton from '../theme/components/rerender.button';
import { useStore } from '../../store';

const ThemeCenter = () => {
  const { t } = useTranslation();
  const { selectedThemeName, setSelectedThemeName, darkMode, setPreviewFullscreen } = useStore();

  const activeChip = darkMode ? 'bg-white text-black' : 'bg-black text-white';
  const idleChip = darkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200';

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('root.themes')}</h1>

      <div className="flex justify-center cursor-zoom-in" onClick={() => setPreviewFullscreen(true)} title="사진 전체보기">
        <Preview className="mt-2" />
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <RerenderButton />
        <button
          type="button"
          onClick={() => setPreviewFullscreen(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          사진 전체보기
        </button>
      </div>

      <h2 className="text-base font-semibold mt-8 mb-3 opacity-80">{t('root.themes.list')}</h2>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setSelectedThemeName(theme.name)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedThemeName === theme.name ? activeChip : idleChip}`}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeCenter;
