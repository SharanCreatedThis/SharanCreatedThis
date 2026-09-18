import React from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "./hangly.css";

export const metadata = {
  title: "Hangly · A little magic for your desktop",
  description:
    "Beautiful digital charms. Real swinging physics. Make your Mac feel a little more you. Free for macOS 14 and later.",
};

export default function HanglyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hangly-container w-full min-h-screen">{children}</div>;
}
