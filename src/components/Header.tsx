"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import ThemeToggle from "@/components/ThemeToggle";
import { useModal } from "@/contexts/ModalContext";

const Header = () => {
  const { openLeadModal } = useModal();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-width-container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center justify-center rounded-xl w-10 h-10 bg-emerald-500/10 border border-emerald-500/20">
            <svg viewBox="0 0 512 512" className="w-6 h-6" aria-hidden="true">
              <polygon points="256,72 256,228 138,268" fill="#10b981"/>
              <polygon points="256,72 256,228 374,268" fill="#0ea5e9"/>
              <polygon points="140,272 372,272 256,420" fill="#cbd5e1"/>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight text-foreground">VaultFill</div>
            <div className="hidden text-[10px] font-medium uppercase tracking-widest text-emerald-500/60 sm:block">Apex Compliance</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-tertiary md:flex">
          <Link className="transition-colors hover:text-foreground" href="/about">Platform</Link>
          <Link className="transition-colors hover:text-foreground" href="/security">Security</Link>
          <Link className="transition-colors hover:text-foreground" href="/pricing">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <SignedOut>
            <button
              onClick={openLeadModal}
              className="btn-primary rounded-full px-4 py-2 text-sm font-bold"
            >
              Get Access
            </button>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;