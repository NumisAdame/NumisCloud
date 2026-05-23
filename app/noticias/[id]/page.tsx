import { PublicLayout } from '@/components/public/public-layout';
import { NewsDetail } from './_components/news-detail';

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  return (
    <PublicLayout>
      <NewsDetail articleId={params.id} />
    </PublicLayout>
  );
}
