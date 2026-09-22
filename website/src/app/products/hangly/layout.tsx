import React from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "./hangly.css";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("hangly");

export default function HanglyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hangly-container w-full min-h-screen">{children}</div>;
}
