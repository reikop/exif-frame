import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TermAndConditionsPage from './pages/term-and-conditions';
import PrivacyPolicyPage from './pages/privacy-policy';
import ExportSettingsPage from './pages/setting/page';
import ThemeSettingsPage from './pages/theme/page';
import { useStore } from './store';
import FramePage from './pages/convert/page';
import LabPage from './pages/lab/page';
import MetadataPage from './pages/metadata/page';
import DesktopShell from './pages/desktop/shell';
import { useIsDesktop } from './hooks/use-is-desktop';

const Root = () => {
  const { tabIndex } = useStore();
  const isDesktop = useIsDesktop();

  if (isDesktop) return <DesktopShell />;

  return (
    <>
      {tabIndex === 0 && <FramePage />}
      {tabIndex === 1 && <ThemeSettingsPage />}
      {tabIndex === 2 && <ExportSettingsPage />}
    </>
  );
};

const Router = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/privacy_policy.html" element={<PrivacyPolicyPage />} />
        <Route path="/term_and_conditions.html" element={<TermAndConditionsPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/metadata" element={<MetadataPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
