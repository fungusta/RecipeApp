'use client';

import Card from '@/components/Card';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-220px)] w-full flex items-center justify-center px-4 py-12">
      <SignedOut>
        <Card
          backgroundColor="bg-[#F5E551] backdrop-blur-xl"
          className="w-full max-w-3xl space-y-8"
        >
          <div className="space-y-3">
            <p className="uppercase tracking-[0.2em] text-xs text-orange-500 font-semibold">
              Homecooked
            </p>
          </div>
            <SignInButton mode="modal" forceRedirectUrl="/">
              <button className="w-full rounded-2xl bg-[#F5E551] hover:bg-[#E4D44B] font-semibold py-4 text-lg shadow-[-3px_3px_4px_0_rgba(0,0,0,0.25)] transition-colors duration-200">
                Log in / Sign up
              </button>
            </SignInButton>
        </Card>
      </SignedOut>
    </div>
  );
}