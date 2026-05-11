import { BlockTitle, List, ListItem } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import AddPhotoButton from '../convert/components/add-photo.button';
import DownloadAllPhotoButton from '../convert/components/download-all-photo.button';
import AddPhotoDragInDrop from '../convert/components/add-photo.drag-in-drop';
import DownloadOnePhotoButton from '../convert/components/download-one-photo.button';
import RemoveOnePhotoButton from '../convert/components/remove-one-photo.button';
import OverrideMetadataButton from '../convert/components/override-metadata.button';
import RemoveAllPhotoButton from '../convert/components/remove-all-photo.button';

const ConvertCenter = () => {
  const { t } = useTranslation();
  const { focalLength35mmMode, photos } = useStore();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('root.convert')}</h1>
        <div className="flex gap-2">
          <AddPhotoButton />
          <DownloadAllPhotoButton />
        </div>
      </div>

      <AddPhotoDragInDrop />

      {photos.length !== 0 && (
        <BlockTitle>
          {t('root.loaded-photos')}
          <RemoveAllPhotoButton />
        </BlockTitle>
      )}

      <List id="list" strongIos inset>
        {photos.map((photo, index) => (
          <ListItem
            key={index}
            media={<img src={photo.thumbnail} alt={photo.file.name} style={{ width: '8rem', height: '6rem', objectFit: 'cover', borderRadius: '0.5rem' }} />}
            title={photo.file.name}
            subtitle={`${focalLength35mmMode ? photo.metadata.focalLengthIn35mm : photo.metadata.focalLength} ${photo.metadata.fNumber} ${photo.metadata.iso} ${photo.metadata.exposureTime}`}
            text={`${photo.metadata.make} ${photo.metadata.model} ${photo.metadata.lensModel}`}
            footer={
              <div className="flex space-x-1 mt-1">
                <OverrideMetadataButton photo={photo} />
                <DownloadOnePhotoButton photo={photo} />
                <RemoveOnePhotoButton index={index} />
              </div>
            }
          />
        ))}
      </List>
    </div>
  );
};

export default ConvertCenter;
