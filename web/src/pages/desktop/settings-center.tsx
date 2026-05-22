import { List } from 'konsta/react';
import { useTranslation } from 'react-i18next';
import DarkModeListItem from '../setting/components/dark-mode.list-item';
import LanguageListItem from '../setting/components/language.list-item';
import QualityListItem from '../setting/components/quality.list-item';
import FixImageWidthListItem from '../setting/components/fix-image-width.list-item';
import ShowCameraMakerListItem from '../setting/components/show-camera-maker.list-item';
import ShowCameraModelListItem from '../setting/components/show-camera-model.list-item';
import ShowLensModelListItem from '../setting/components/show-lens-model.list-item';
import FixWatermarkListItem from '../setting/components/fix-watermark.list-item';
import ExportToJpegListItem from '../setting/components/export-to-jpeg.list-item';
import BugReportListItem from '../setting/components/bug-report.list-item';
import ReleasesListItem from '../setting/components/releases.list-item';
import CurrentVersionListItem from '../setting/components/current-version.list-item';
import FocalLength35mmModeListItem from '../setting/components/focal-length-35mm-mode.list-item';
import DisableExposureMeterListItem from '../setting/components/disable-exposure-meter.list-item';
import RatioListItem from '../setting/components/ratio.list-item';
import TermAndConditionsListItem from '../setting/components/term-and-conditions.list-item';
import PrivacyPolicyListItem from '../setting/components/privacy-policy.list-item';
import FocalLengthRatioModeListItem from '../setting/components/focal-length-ratio-mode.list-item';
import LabListItem from '../setting/components/lab.list-item';
import DateNotationListItem from '../setting/components/date-notation.list-item';
import OverrideMetadataListItem from '../setting/components/override-metadata.list-item';
import CreateOverrideMetadataListItem from '../setting/components/create-override-metadata.list-item';
import MaintainExifListItem from '../setting/components/maintain-exif.list-item';
import OriginalAuthorListItem from '../setting/components/original-author.list-item';

const SettingsCenter = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{t('root.settings')}</h1>

      <List strongIos inset>
        <DarkModeListItem />
        <LanguageListItem />
        <FixWatermarkListItem />
      </List>

      <List strongIos inset>
        <ExportToJpegListItem />
        <MaintainExifListItem />
        <QualityListItem />
        <FixImageWidthListItem />
        <FocalLengthRatioModeListItem />
        <FocalLength35mmModeListItem />
        <RatioListItem />
        <DateNotationListItem />
      </List>

      <List strongIos inset>
        <DisableExposureMeterListItem />
        <ShowCameraMakerListItem />
        <ShowCameraModelListItem />
        <ShowLensModelListItem />
      </List>

      <List strongIos inset>
        <OverrideMetadataListItem />
        <CreateOverrideMetadataListItem />
      </List>

      <List strongIos inset>
        <BugReportListItem />
        <ReleasesListItem />
      </List>

      <List strongIos inset>
        <PrivacyPolicyListItem />
        <TermAndConditionsListItem />
      </List>

      <List strongIos inset>
        <LabListItem />
        <CurrentVersionListItem />
        <OriginalAuthorListItem />
      </List>
    </div>
  );
};

export default SettingsCenter;
