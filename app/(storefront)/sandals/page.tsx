import { ShopScreen } from '@/app/components/storefront/ShopScreen';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SandalsPage({ searchParams }: PageProps) {
  return (
    <ShopScreen
      title="Sandals"
      description="Slides and straps tuned for comfort—ideal for warm weather and easy days."
      filters={{ category: 'Sandals' }}
      searchParams={await searchParams}
    />
  );
}

