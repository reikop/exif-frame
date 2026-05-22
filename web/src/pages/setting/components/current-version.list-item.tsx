import { ListItem } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import PackageJson from '../../../../package.json';
import RobotIcon from '../../../icons/robot.icon';

const CurrentVersionListItem = () => {
  const { t } = useTranslation();

  return (
    <ListItem
      media={<RobotIcon size={26} />}
      title={t('root.settings.current-version')}
      after={<span style={{ color: 'var(--kon-color-primary)' }}>Fork v{PackageJson.version}</span>}
      link
      onClick={() => window.open('https://github.com/reikop/exif-frame')}
    />
  );
};

export default CurrentVersionListItem;
