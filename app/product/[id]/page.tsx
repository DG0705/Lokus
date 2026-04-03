import { supabase } from '@/app/lib/supabase'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Fetch product from Supabase
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center text-6xl">
          👟
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-gray-600 mb-4">${product.price}</p>
          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Size</h3>
            <div className="flex gap-2 flex-wrap">
              {product.sizes?.map((size: number) => (
                <button key={size} className="border border-gray-300 rounded-lg px-4 py-2 hover:border-black transition">
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-medium mb-2">Color</h3>
            <div className="flex gap-2">
              {product.colors?.map((color: string) => (
                <button key={color} className="border border-gray-300 rounded-lg px-4 py-2 hover:border-black transition">
                  {color}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition font-medium">
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}