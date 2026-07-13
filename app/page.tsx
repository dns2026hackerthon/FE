import { RequireAuth } from '@/components/RequireAuth';
import MainPage from '@/screens/MainPage';

export default function Page() {
  return (
    <RequireAuth>
      <MainPage />
    </RequireAuth>
  );
}
