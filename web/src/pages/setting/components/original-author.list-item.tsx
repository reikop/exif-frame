import { ListItem } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import PullRequestIcon from '../../../icons/pull-request.icon';

const OriginalAuthorListItem = () => {
  const { t } = useTranslation();

  return (
    <ListItem
      media={<PullRequestIcon size={26} />}
      title={t('root.original-author')}
      after="jeonghyeon-net"
      link
      onClick={() => window.open('https://github.com/jeonghyeon-net/exif-frame')}
    />
  );
};

export default OriginalAuthorListItem;
