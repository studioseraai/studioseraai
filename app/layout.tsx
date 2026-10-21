import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Studio Seraai OS — Art Vault',description:'Private artwork inventory and gallery operations for Studio Seraai'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
