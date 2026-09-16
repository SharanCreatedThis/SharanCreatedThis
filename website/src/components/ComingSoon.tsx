"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Clock, ArrowRight } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  showHomeDetails?: boolean;
}

export function ComingSoon({
  title = "Coming Soon",
  subtitle,
  showHomeDetails = false,
}: ComingSoonProps) {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-8 backdrop-blur-md shadow-inner">
          <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Under Active Construction</span>
        </div>

        {/* Header / Brand Title */}
        {showHomeDetails ? (
          <>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-400">
              Sharan Created This
            </h1>
            <p className="text-base sm:text-xl font-medium text-amber-400/90 tracking-wide mb-8">
              Filmmaker • Photographer • Designer • Developer
            </p>
          </>
        ) : (
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {title}
          </h1>
        )}

        {/* Large Coming Soon Display */}
        <div className="relative my-6 px-8 py-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md shadow-2xl">
          <span className="text-4xl sm:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 uppercase">
            Coming Soon
          </span>
        </div>

        <p className="text-sm sm:text-base text-neutral-400 max-w-lg mb-10 leading-relaxed">
          {subtitle ||
            "I'm crafting something special for this page. In the meantime, explore our live products below."}
        </p>

        {/* Action Button */}
        <Link
          href="/products"
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-sm hover:brightness-110 shadow-lg shadow-orange-500/20 transition-all duration-200"
        >
          <span>Explore Live Products</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
