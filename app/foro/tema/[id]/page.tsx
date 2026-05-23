import { AppLayout } from '@/components/app/app-layout';
import { TopicContent } from './_components/topic-content';

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <TopicContent topicId={params?.id ?? ''} />
    </AppLayout>
  );
}
