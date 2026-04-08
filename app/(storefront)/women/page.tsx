import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type WomenPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WomenPage({ searchParams }: WomenPageProps) {
  return (
    <ShopScreen
      title="Women's footwear edit"
      description="Fashion-forward silhouettes and performance-minded essentials, brought together in one premium curation."
      filters={{ gender: 'Women' }}
      searchParams={await searchParams}
    />
  );
}
