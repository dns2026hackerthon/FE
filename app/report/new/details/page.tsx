import { RequireAuth } from '@/components/RequireAuth';
import ReportDetailsPage from '@/screens/ReportDetailsPage';

export default function Page() {
  return (
    <RequireAuth>
      <ReportDetailsPage />
    </RequireAuth>
  );
}
