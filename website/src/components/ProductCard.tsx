"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Monitor, Shield } from "lucide-react";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const getIcon = (id: string) => {
    if (id === "hangly") return <Sparkles className="w-6 h-6 text-amber-400" />;
    if (id === "vision") return <Shield className="w-6 h-6 text-cyan-400" />;
    return <Monitor className="w-6 h-6 text-amber-400" />;
  };

  return (
    <div className="group relative rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col justify-between overflow-hidden">
      {/* Background Gradient Glow on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            {getIcon(product.id)}
          </div>
          {product.badge && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 backdrop-blur-md">
              {product.badge}
            </span>
          )}
        </div>

        {/* Title & Tagline */}
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
          {product.title}
        </h3>
        <p className="text-xs font-medium uppercase tracking-wider text-amber-500/80 mb-4">
          {product.tagline}
        </p>

        {/* Description */}
        <p className="text-sm text-neutral-300/90 leading-relaxed mb-8">
          {product.description}
        </p>
      </div>

      {/* Action CTA Button */}
      <div className="relative z-10 pt-4 border-t border-neutral-800/80">
        <Link
          href={product.link}
          className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-neutral-800/80 hover:bg-amber-500 text-white hover:text-black font-semibold text-sm transition-all duration-200 group/btn shadow-md"
        >
          <span>{product.buttonText}</span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
