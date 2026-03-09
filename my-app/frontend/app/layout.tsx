import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";



export const metadata: Metadata = {
  title: "chat app",
  description: "Created by Akash ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
           {children}
        </AppProvider>
      </body>
    </html>
  );
}
