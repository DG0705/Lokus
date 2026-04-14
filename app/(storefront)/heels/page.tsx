import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HeelsPage({ searchParams }: PageProps) {
  return (
    <ShopScreen
      title="Heels"
      description="Sleek heeled profiles with premium finishing—built for nights out and sharp fits."
      filters={{ category: 'Heels' }}
      searchParams={await searchParams}
    />
  );
}

