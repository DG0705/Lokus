import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <ShopScreen
      title="The complete shoe catalog"
      description="Filter by brand, gender, category, price, and size to discover a polished selection of premium footwear."
      searchParams={await searchParams}
    />
  );
}
