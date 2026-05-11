import { List } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import themes from '../../themes';
import Customize from '../theme/database/customize';
import ThemeOptionListInput from '../theme/components/theme-option.list-input';
import ThemeOptionResetButton from '../theme/components/theme-option-reset.button';

const ThemeOptionsPanel = () => {
  const { t } = useTranslation();
  const { selectedThemeName, darkMode, setRerenderOptions } = useStore();
  const theme = themes.find((theme) => theme.name === selectedThemeName);
  const presets = (theme as { presets?: { name: string; values: Record<string, string | number | boolean> }[] } | undefined)?.presets;

  const headerBg = darkMode ? 'border-neutral-800' : 'border-gray-200';
  const presetIdle = darkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200';

  const applyPreset = (values: Record<string, string | number | boolean>) => {
    if (!theme) return;
    theme.options.forEach((opt) => Customize.delete(theme.name, opt.id));
    Object.entries(values).forEach(([k, v]) => Customize.set(theme.name, k, v));
    setRerenderOptions();
  };

  return (
    <div>
      <div className={`px-5 py-4 border-b ${headerBg} sticky top-0 backdrop-blur ${darkMode ? 'bg-neutral-900/80' : 'bg-white/80'}`}>
        <p className="text-xs uppercase tracking-wider opacity-60">{t('root.themes.customize')}</p>
        <div className="flex items-center justify-between mt-1">
          <h2 className="text-lg font-semibold truncate">{selectedThemeName}</h2>
          {theme && theme.options.length !== 0 && <ThemeOptionResetButton />}
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div className="px-5 pt-4">
          <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.values)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${presetIdle}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
