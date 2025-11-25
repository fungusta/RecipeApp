import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
} from '@clerk/nextjs'
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Card from "@/components/Card";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Recipe App",
  description: "Discover and manage your favorite recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${nunito.variable} font-sans antialiased min-h-screen flex flex-col`}
        >
          <SignedIn>
            <Header />
          </SignedIn>
          <main className="flex-1">
          <SignedOut>
              <div className="min-h-[calc(100vh-220px)] w-full flex items-center justify-center px-4 py-12">
                <Card
                  backgroundColor="bg-[#F5E551] backdrop-blur-xl"
                  className="w-full max-w-3xl space-y-8"
                >
                  <div className="space-y-3">
                    <p className="uppercase tracking-[0.2em] text-xs text-orange-500 font-semibold">
                      Recipe App
                    </p>
                  </div>
                  <SignInButton mode="modal" forceRedirectUrl="/">
                    <button className="w-full rounded-2xl bg-[#F5E551] hover:bg-[#E4D44B] font-semibold py-4 text-lg shadow-[-3px_3px_4px_0_rgba(0,0,0,0.25)] transition-colors duration-200">
                      Log in / Sign up
                    </button>
                  </SignInButton>
                </Card>
              </div>
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
          </main>
          <SignedIn>
            <Footer />
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
