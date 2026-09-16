import React from "react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles, Layers } from "lucide-react";

export const metadata = {
  title: "Products | Sharan Created This",
  description: "Physics-powered macOS companions and Face ID security experiences for Mac.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6 backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Product Suite</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
          Crafted for macOS
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
          Delightful, powerful desktop experiences built with native performance, thoughtful design, and subtle magic.
        </p>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
