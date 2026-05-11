import { ListInput, ListItem, Range, Toggle } from 'konsta/react';
import { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import Customize from '../database/customize';
import { ThemeOption, getConverter } from '../types/theme-option';

const ThemeOptionListInput = (props: ThemeOption) => {
  const { selectedThemeName, rerenderOptions, darkMode, setRerenderOptions } = useStore();
  const [value, setValue] = useState(Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default);

  useEffect(() => {
    setValue(Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThemeName, rerenderOptions]);

  const commit = (next: string | number | boolean) => {
    Customize.set(selectedThemeName, props.id, next);
    setValue(next);
    setRerenderOptions();
  };

  const isModified = value !== props.default;
  const resetTitle = `Reset to default (${props.default})`;
  const ResetButton = () => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        commit(props.default);
      }}
      title={resetTitle}
      aria-label={resetTitle}
      className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded text-sm transition-opacity ${
        isModified ? 'opacity-70 hover:opacity-100' : 'opacity-25 hover:opacity-60'
      } ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-200'}`}
    >
      ↺
    </button>
  );

  const titleWithReset = (
    <span className="inline-flex items-center gap-1">
      {props.id}
      <ResetButton />
    </span>
  ) as unknown as string;

  return (
    <>
      {props.type === 'number' && (
        <ListInput key={props.id} name={props.id} title={titleWithReset} info={props.description} value={value} onChange={(e) => commit(e.target.value)} />
      )}

      {props.type === 'string' && (
        <ListInput key={props.id} name={props.id} title={titleWithReset} info={props.description} value={value} onChange={(e) => commit(e.target.value)} />
      )}

      {props.type === 'color' && (
        <ListItem
          key={props.id}
          title={titleWithReset}
          footer={props.description}
          innerChildren={
            <div className="flex items-center gap-3 mt-1 w-full">
              <input
                type="color"
                value={value as string}
                onChange={(e) => commit(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border-0 p-0 bg-transparent"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => commit(e.target.value)}
                className={`flex-1 px-2 py-1.5 rounded text-sm font-mono outline-none ${darkMode ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-black'}`}
              />
            </div>
          }
        />
      )}

      {props.type === 'select' && (
        <ListInput key={props.id} name={props.id} title={titleWithReset} info={props.description} value={value} type="select" onChange={(e) => commit(e.target.value)} dropdown>
          {props.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </ListInput>
      )}

      {props.type === 'range-slider' && (
        <ListItem
          key={props.id}
          title={titleWithReset}
          innerChildren={
            <div className="flex space-x-4 rtl:space-x-reverse">
              <span>{value}</span>
              <Range value={value} min={props.min} max={props.max} step={props.step} onChange={(e) => commit(Number(e.target.value))} />
            </div>
          }
        />
      )}

      {props.type === 'boolean' && (
        <ListItem key={props.id} title={titleWithReset} footer={props.description} after={<Toggle key={props.id} checked={value as boolean} onChange={() => commit(!value)} />} />
      )}
    </>
  );
};

export default ThemeOptionListInput;
