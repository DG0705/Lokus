import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BootsPage({ searchParams }: PageProps) {
  return (
    <ShopScreen
      title="Boots"
      description="Leather-forward pairs with grip and structure—made for rain, travel, and long wear."
      filters={{ category: 'Boots' }}
      searchParams={await searchParams}
    />
  );
}

