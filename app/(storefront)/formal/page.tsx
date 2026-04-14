import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FormalPage({ searchParams }: PageProps) {
  return (
    <ShopScreen
      title="Formal shoes"
      description="Oxfords, loafers, and polished silhouettes designed for office hours and evening plans."
      filters={{ category: 'Formal' }}
      searchParams={await searchParams}
    />
  );
}

