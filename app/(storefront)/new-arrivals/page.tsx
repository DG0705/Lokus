import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type NewArrivalsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewArrivalsPage({ searchParams }: NewArrivalsPageProps) {
  return (
    <ShopScreen
      title="New arrivals"
      description="The latest additions to the LOKUS edit, surfaced first with a premium launch presentation."
      filters={{ sort: 'newest' }}
      searchParams={await searchParams}
    />
  );
}
