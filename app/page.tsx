export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          LOKUS
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Where every step finds its place
        </p>
        <button className="mt-8 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition">
          Shop Now
        </button>
      </section>

      {/* Featured Shoes (placeholder) */}
      <section className="px-4 py-12">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Coming Soon
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl p-8 text-center">
              <div className="bg-gray-200 h-48 rounded-xl mb-4 flex items-center justify-center">
                👟
              </div>
              <h3 className="font-medium">Premium Sneaker {i}</h3>
              <p className="text-gray-500">$129</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}