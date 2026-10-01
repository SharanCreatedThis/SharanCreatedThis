import React from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "../products/hangly/hangly.css";
import "./admin.css";

/** Hangly's own look: the product page's palette and type, inside its container. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="hangly-container w-full min-h-screen">{children}</div>;
}
