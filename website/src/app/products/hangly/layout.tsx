import React from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "./hangly.css";
import { pageMetadata } from "@/lib/metadata";

// The site-wide keywords describe the portfolio (filmmaking, cameras); these pages are about the app.
export const metadata = {
  ...pageMetadata("hangly"),
  keywords: ["Hangly", "desktop charms", "desktop charm app", "hanging charm", "swinging charm", "nazar on desktop",
    "Mac desktop customisation", "Windows desktop customisation", "Sharan Created This"],
};

export default function HanglyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hangly-container w-full min-h-screen">{children}</div>;
}
