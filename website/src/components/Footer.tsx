import React from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800/80 bg-[#09090b] text-neutral-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black font-bold text-xs">
              S
            </div>
            <span className="font-semibold text-neutral-100 text-sm tracking-tight">
              Sharan Created This
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-sm">
            Filmmaker • Photographer • Designer • Developer
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-xs text-neutral-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link href="/portfolio" className="hover:text-amber-400 transition-colors">Portfolio</Link>
          <Link href="/products" className="hover:text-amber-400 transition-colors">Products</Link>
          <Link href="/about" className="hover:text-amber-400 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
        </div>

        <div className="text-xs text-neutral-500">
          © {new Date().getFullYear()} Sharan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
