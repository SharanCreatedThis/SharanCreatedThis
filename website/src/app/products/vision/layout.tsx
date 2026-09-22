import { pageMetadata } from "@/lib/metadata";
import localFont from 'next/font/local';
import './vision.css';

const inter = localFont({ src: '../../../../public/vision/fonts/inter-latin-variable.woff2', weight: '100 900', display: 'swap', variable: '--font-inter' });
export const metadata = pageMetadata("vision");
export default function VisionLayout({ children }: { children: React.ReactNode }) {
  return <div className={`vision-container w-full min-h-screen ${inter.variable}`}>{children}</div>;
}
