import { PublicLayout } from '@/components/public/public-layout';
import { PublicProfileContent } from './_components/public-profile-content';

export default function UserPublicProfilePage({ params }: { params: { id: string } }) {
  return (
    <PublicLayout>
      <PublicProfileContent userId={params?.id ?? ''} />
    </PublicLayout>
  );
}
