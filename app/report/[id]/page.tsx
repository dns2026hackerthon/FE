import { RequireAuth } from '@/components/RequireAuth';
import DetailPage from '@/screens/DetailPage';

export default function Page() {
  return (
    <RequireAuth>
      <DetailPage />
    </RequireAuth>
  );
}
