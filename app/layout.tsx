import type { Metadata } from 'next';
import './globals.css';
import './polish.css';
import localFont from 'next/font/local';
const display = localFont({ src: '../public/fonts/cormorant-garamond.woff', variable: '--font-display', display: 'swap', weight: '300 700' });
const ui = localFont({ src: '../public/fonts/manrope.woff', variable: '--font-interface', display: 'swap', weight: '200 800' });
export const metadata: Metadata = { title: 'SERAAI OS — Your Gallery, Considered', applicationName:'SERAAI OS', icons:{icon:'/brand/seraai-os-logo.webp'}, description: 'Private artwork inventory and gallery operations for Studio Seraai' };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en" className={`${display.variable} ${ui.variable}`}><body>{children}</body></html>; }
