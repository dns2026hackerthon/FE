import { RequireAuth } from '@/components/RequireAuth';
import ReportPhotoPage from '@/screens/ReportPhotoPage';

export default function Page() {
  return (
    <RequireAuth>
      <ReportPhotoPage />
    </RequireAuth>
  );
}
