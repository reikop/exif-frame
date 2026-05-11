import { List } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import themes from '../../themes';
import ThemeOptionListInput from '../theme/components/theme-option.list-input';
import ThemeOptionResetButton from '../theme/components/theme-option-reset.button';

const ThemeOptionsPanel = () => {
  const { t } = useTranslation();
  const { selectedThemeName, darkMode } = useStore();
  const theme = themes.find((theme) => theme.name === selectedThemeName);

  const headerBg = darkMode ? 'border-neutral-800' : 'border-gray-200';

  return (
    <div>
      <div className={`px-5 py-4 border-b ${headerBg} sticky top-0 backdrop-blur ${darkMode ? 'bg-neutral-900/80' : 'bg-white/80'}`}>
        <p className="text-xs uppercase tracking-wider opacity-60">{t('root.themes.customize')}</p>
        <div className="flex items-center justify-between mt-1">
          <h2 className="text-lg font-semibold truncate">{selectedThemeName}</h2>
          {theme && theme.options.length !== 0 && <ThemeOptionResetButton />}
        </div>
      </div>

      {theme && theme.options.length !== 0 ? (
        <List strongIos>
          {theme.options.map((option, index) => (
            <ThemeOptionListInput {...option} key={index} />
          ))}
        </List>
      ) : (
        <p className="px-5 py-10 text-sm opacity-60 text-center">No options for this theme.</p>
      )}
    </div>
  );
};

export default ThemeOptionsPanel;
