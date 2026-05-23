import { AppLayout } from '@/components/app/app-layout';
import { CategoryContent } from './_components/category-content';

export default function ForumCategoryPage({ params }: { params: { slug: string } }) {
  return (
    <AppLayout>
      <CategoryContent slug={params?.slug ?? ''} />
    </AppLayout>
  );
}
