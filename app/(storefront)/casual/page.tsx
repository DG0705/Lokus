import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CasualPage({ searchParams }: PageProps) {
  return (
    <ShopScreen
      title="Casual shoes"
      description="Everyday comfort with clean lines—pairs that work with denim, linen, and relaxed tailoring."
      filters={{ category: 'Casual' }}
      searchParams={await searchParams}
    />
  );
}

