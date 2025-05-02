"use client";

import {
  BotIcon,
  CrownIcon,
  GalleryVerticalEndIcon,
  Layers2Icon
} from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

const data = {
  navMain: [
    {
      title: "Tiers",
      url: "/tiers",
      icon: Layers2Icon,
    },
    {
      title: "Models",
      url: "/models",
      icon: BotIcon,
    },
    {
      title: "Summary",
      url: "/summary",
      icon: GalleryVerticalEndIcon,
    },

  ],
  navSecondary: [
    {
      title: "Upgrade",
      url: "/upgrade",
      icon: CrownIcon,
    },
  ],
};


export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || '',
  };



  return (
    <Sidebar collapsible="icon"  {...props}>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}


