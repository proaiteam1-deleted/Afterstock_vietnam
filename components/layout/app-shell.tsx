import type { ReactNode } from "react";

import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Header } from "@/components/layout/header";

type AppShellProps = {
  children: ReactNode;
  showDisclaimer?: boolean;
};

export function AppShell({ children, showDisclaimer = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
        {showDisclaimer ? (
          <div className="mt-8">
            <DisclaimerBanner />
          </div>
        ) : null}
      </main>
    </div>
  );
}
