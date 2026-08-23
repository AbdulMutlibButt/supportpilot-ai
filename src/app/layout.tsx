import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "SupportPilot AI — Customer support, elevated", template: "%s | SupportPilot AI" }, description: "The intelligent support workspace for modern customer teams." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" suppressHydrationWarning><body>{children}</body></html> }
