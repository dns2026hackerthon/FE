import { RequireAuth } from '@/components/RequireAuth';
import MyPage from '@/screens/MyPage';

export default function Page() {
  return (
    <RequireAuth>
      <MyPage />
    </RequireAuth>
  );
}
