import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SneakersPage({ searchParams }: PageProps) {
  return (
    <ShopScreen
      title="Sneakers"
      description="Street-ready profiles, cushioned steps, and clean colorways—built for daily rotation."
      filters={{ category: 'Sneakers' }}
      searchParams={await searchParams}
    />
  );
}

