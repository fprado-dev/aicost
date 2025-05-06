import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import { AppSidebar } from "@/components/app-sidebar";
import OnboardingModal from "@/components/onboarding-modal";
import { ProjectSwitcher } from "@/components/project-switcher";
import { TierSwitcher } from "@/components/tier-switcher";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <SidebarProvider>
              {user?.id && <AppSidebar user={user} />}
              <SidebarInset>
                <div className="flex flex-1 flex-col">
                  <OnboardingModal />
                  {user?.id && (
                    <div className="flex">
                      <ProjectSwitcher />
                      <TierSwitcher />
                    </div>
                  )}
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
