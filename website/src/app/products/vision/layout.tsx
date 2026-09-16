import React from "react";
import "./vision.css";

export const metadata = {
  title: "Vision | Security and unlocking experience for Mac",
  description: "Face ID-inspired security and unlocking experience for Mac.",
};

export default function VisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="vision-container w-full min-h-screen">{children}</div>;
}
