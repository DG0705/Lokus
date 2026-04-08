import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type MenPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MenPage({ searchParams }: MenPageProps) {
  return (
    <ShopScreen
      title="Men's footwear edit"
      description="Refined runners, statement sneakers, and polished everyday pairs for the modern men's rotation."
      filters={{ gender: 'Men' }}
      searchParams={await searchParams}
    />
  );
}
